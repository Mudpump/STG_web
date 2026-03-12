
import { Type } from "@google/genai";
import { CategoryId } from '../types';
import { CATEGORY_IMAGES, TREND_IMAGE_POOL } from '../constants';
import { getRandomCategory } from '../utils/aiMappings';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

// --- Shared Instructions ---

const CONTENT_INSTRUCTION = `
    [Content Guidelines]
    1. **Language**: The entire response MUST be in **Korean** (한국어).
    2. **Length & Depth**: Write a **Long, High-Density article** (approx. **5-7 minutes read**, 1200자 수준). 
       - It must match the difficulty of a **Korean SAT (CSAT/수능) Non-literature (비문학/독서) 'Killer Passage'**.
       - **Information Density**: Intentionally **minimize transition words** (e.g., 'however', 'therefore') to force the reader to infer logical connections.
       - **Academic Tone**: Use precise, professional academic vocabulary relevant to the major.
       - **Structure**: Introduce **conflicting viewpoints**, complex causal chains (A→B→C), or detailed mechanisms.
    3. **Topic Scope**: Focus on **2026 Trends** in Society, Culture, Technology, Economy, Politics, Environment, or Science.
    4. **SeTeuk Tip (Student Record Connection)**: 
       - **CRITICAL**: Connect the trend strictly to **Korean High School Curriculum Subjects** (고등학교 교과목).
       - **DO NOT** use University Major names as headings. Use **High School Subjects**.
       - **Structure Example**:
         - **확률과 통계**: [Analyze the trend using statistical data...]
         - **생활과 윤리**: [Discuss the ethical implications...]
    5. **Title Constraint**: Do NOT include the year "2026" in the title.
`;

const QUIZ_INSTRUCTION = `
    3. **Generate 2 High-Difficulty Quizzes (CSAT Killer Level)**:
       
       **Q1. Logical Inference & Plausible Distractors (Facts/Inference)**
       - **Goal**: Test ability to distinguish subtle logical errors.
       - **Distractor Strategy**:
         1. **Partial Truth**: The option is 90% correct but the final predicate or conclusion is wrong.
         2. **Causal Reversal**: Swap the cause and effect (e.g., "A caused B" -> "B caused A").
         3. **Concept Mixing**: Attribute a characteristic of Concept A to Concept B.
       - **Correct Answer**: Should require synthesizing information from different parts of the text, not just keyword matching.

       **Q2. Application to New Context (<Box> Type)**
       - **Goal**: Test ability to apply the text's theory to a **NEW, external scenario**.
       - **Formatting Rules (CRITICAL)**: 
         1. **Question Text**: When referring to the box in the question sentence, use **[보기]** with square brackets (e.g., "윗글을 바탕으로 [보기]를 이해한 내용으로..."). **DO NOT** use <보기> in the question sentence.
         2. **Box Content**: Wrap the actual scenario content with **<보기>** and **</보기>** tags at the end of the question.
       - **Scenario (<Box>)**: Create a concrete case study or hypothetical situation (3-4 sentences) that is **NOT** in the main text but can be analyzed using the text's logic.
       - **Structure**: "[Question Text referring to [보기]] \n\n <보기> [Scenario Content] </보기>"
       
       - **Difficulty**: Very Hard.
       - **Correct Rate**: Estimate a realistic rate (e.g., 38%, 42%).
`;

// Updated Comment Instruction to use specific Cast
const getCommentInstruction = (castListStr: string) => `
    4. **Comments Generation**:
       - Generate **6 comments**.
       - **Cast (DB Agents)**: You MUST use the following characters for the comments. Do not invent new names.
         ${castListStr}
       - **Tone**: Informal Korean internet slang (Banmal).
       - **Content**: 
         - The comments should be diverse reactions (amazement, skepticism, jokes, summary).
         - Ensure the comments feel like a real conversation between students.
         - Avoid repetitive patterns (e.g. don't start every comment with "Wow").
`;

const QUIZ_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.NUMBER, description: "Index of correct answer (0-4)" },
            explanation: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["FACT_CHECK", "INFERENCE"] },
            correctRate: { type: Type.NUMBER }
        },
        required: ["question", "options", "answer", "explanation", "type"]
    }
};

// --- Helper: Image Selector ---
async function selectValidatedImage(keyword: string, categoryId: string, log: (msg: string) => void): Promise<string> {
    log(`🖼️ 이미지 선택: 키워드("${keyword}") 기반 이미지 검색 시작 (${categoryId})`);

    const normalizedKeyword = keyword.toLowerCase();
    
    // 1. Filter by Category
    const categoryImages = TREND_IMAGE_POOL.filter(img => img.categoryId === categoryId);
    
    // Choose pool to search (category-specific or all if category is empty)
    const searchPool = categoryImages.length > 0 ? categoryImages : TREND_IMAGE_POOL;

    // 2. Score images based on tag matches
    let bestImages = [];
    let maxScore = -1;

    for (const img of searchPool) {
        let score = 0;
        for (const tag of img.tags) {
            if (normalizedKeyword.includes(tag.toLowerCase()) || tag.toLowerCase().includes(normalizedKeyword)) {
                score++;
            }
        }
        
        if (score > maxScore && score > 0) {
            maxScore = score;
            bestImages = [img];
        } else if (score === maxScore && score > 0) {
            bestImages.push(img);
        }
    }

    // 3. Select Image
    if (bestImages.length > 0) {
        // Match found! Pick random from best matches
        const selected = bestImages[Math.floor(Math.random() * bestImages.length)];
        log(`🖼️ 연관 이미지 발견! (태그 매치: ${maxScore}점)`);
        return selected.url;
    } else if (categoryImages.length > 0) {
        // No tag match, but category pool exists. Pick random from category.
        const selected = categoryImages[Math.floor(Math.random() * categoryImages.length)];
        log(`🖼️ 키워드 매칭 실패. 카테고리 내 랜덤 이미지 제공.`);
        return selected.url;
    }

    // 4. Ultimate Fallback
    log(`🖼️ 매칭 실패. 기본 카테고리 이미지 제공.`);
    const fallbackUrl = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES['ALL'];
    return fallbackUrl;
}

// --- Trend Agents ---
export const runTrendAgents = async (log: (msg: string) => void): Promise<any> => {
    log("📈 Trend Agents: 2026 최신 트렌드 심층 분석 및 퀴즈 출제 중...");
    const category = getRandomCategory();
    
    // Fetch 6 random agents from DB
    const { commenters } = await fetchCastFromDB(category.id, 6);
    const castListStr = commenters.map(c => `- ${c.nickname} (Role: ${c.role_type})`).join('\n');

    const prompt = `
      You are an elite Educational Content Creator for high school students.
      Target Major Category: ${category.name}
      Current Year: 2026.
      
      [Task]
      Create a "Trend Report" that analyzes a significant issue in 2026 related to the target category.
      
      ${CONTENT_INSTRUCTION}
      ${QUIZ_INSTRUCTION}
      ${getCommentInstruction(castListStr)}

      [Output JSON]
      {
        "title": "string (Catchy Korean Title)",
        "keyword": "string (Main Keyword)",
        "summary": ["string", "string", "string"],
        "content": "string (1200 words Long, detailed Korean text, markdown supported)",
        "seTeukTip": "string (Bullet points in Korean, each on a new line, connect to High School Subjects)",
        "comments": [{ "agentName": "string", "text": "string" }],
        "quizzes": [ ... ]
      }
    `;
    
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    keyword: { type: Type.STRING },
                    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    content: { type: Type.STRING },
                    seTeukTip: { type: Type.STRING },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { agentName: { type: Type.STRING }, text: { type: Type.STRING } },
                            required: ["agentName", "text"]
                        }
                    },
                    quizzes: QUIZ_SCHEMA
                },
                required: ["title", "keyword", "summary", "content", "seTeukTip", "comments", "quizzes"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");
    const generatedComments = (result.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.agentName.replace(/\s/g, ''), // Enforce No Spaces
        role: 'Peer',
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 20),
        createdAt: "방금 전",
        isUser: false
    }));

    // Image Logic
    const finalImageUrl = await selectValidatedImage(result.keyword, category.id, log);

    return { 
        ...result, 
        content: cleanText(result.content),
        seTeukTip: cleanText(result.seTeukTip),
        targetMajor: category.name,
        imageUrl: finalImageUrl, 
        likeCount: Math.floor(Math.random() * 50) + 10,
        comments: generatedComments 
    };
};

export const runSourceTrendAgents = async (sourceText: string, log: (msg: string) => void): Promise<any> => {
    log("📰 Source Trend Agent: 텍스트 심층 분석 및 수능형 문제 출제 중...");
    
    // Fetch 6 random agents from DB
    const { commenters } = await fetchCastFromDB(null, 6);
    const castListStr = commenters.map(c => `- ${c.nickname} (Role: ${c.role_type})`).join('\n');

    const prompt = `
        Educational Editor.
        [Input Text] 
        ${sourceText.substring(0, 5000)}

        [Task] 
        Analyze the input and rewrite it into a "High School Trend Report".
        
        ${CONTENT_INSTRUCTION}
        ${QUIZ_INSTRUCTION}
        ${getCommentInstruction(castListStr)}
        
        [Output JSON]
        {
          "title": "string (Korean)",
          "keyword": "string",
          "targetCategoryId": "string (ELEC_SEMI, CS_AI, MECH_ROBOT, CHEM_MAT, BIO_MED, BIZ_ECON, SOC_MEDIA, HUM_EDU)",
          "targetMajorName": "string",
          "summary": ["string"],
          "content": "string (Long, detailed Korean text)",
          "seTeukTip": "string (Bullet points in Korean, each on a new line, connect to High School Subjects)",
          "comments": [{ "agentName": "string", "text": "string" }],
          "quizzes": [ ... ]
        }
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    keyword: { type: Type.STRING },
                    targetCategoryId: { type: Type.STRING },
                    targetMajorName: { type: Type.STRING },
                    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    content: { type: Type.STRING },
                    seTeukTip: { type: Type.STRING },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { agentName: { type: Type.STRING }, text: { type: Type.STRING } },
                            required: ["agentName", "text"]
                        }
                    },
                    quizzes: QUIZ_SCHEMA
                },
                required: ["title", "keyword", "targetCategoryId", "targetMajorName", "summary", "content", "seTeukTip", "comments", "quizzes"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");
    const catId = result.targetCategoryId as CategoryId;
    const generatedComments = (result.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.agentName.replace(/\s/g, ''),
        role: 'Peer',
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 20),
        createdAt: "방금 전",
        isUser: false
    }));

    const finalImageUrl = await selectValidatedImage(result.keyword, catId, log);

    return { 
        ...result, 
        content: cleanText(result.content),
        seTeukTip: cleanText(result.seTeukTip),
        targetMajor: result.targetMajorName,
        imageUrl: finalImageUrl,
        likeCount: Math.floor(Math.random() * 50) + 10,
        comments: generatedComments 
    };
}

export const runSearchTrendAgents = async (keyword: string | undefined, log: (msg: string) => void): Promise<any> => {
    // A diverse list of search seeds
    const SEARCH_SEEDS = [
        "2026 environment issue",
        "2026 AI global trend",
        "2026 latest space news",
        "2026 astronomy news",
        "2026 global economic news",
        "2026 future jobs",
        "2026 social issues",
        "2026 cultural trends art",
        "2026 bio and medical breakthroughs",
        "2026 psychological trends",
        "2026 아동 관련 이슈",
        "2026 renewable energy and sustainable development",
        "2026 digital privacy and cyber security issues",
        "2026 education revolution and edtech trends",
        "2026 international conflict and peace efforts",
        "2026 state of the art technologies issues",
        "2026 state of the art Science breakthrough",
        "2026 인문/철학 분야 주요 이슈"
    ];

    const randomSeed = SEARCH_SEEDS[Math.floor(Math.random() * SEARCH_SEEDS.length)];
    const query = keyword || randomSeed;

    log(`🔎 Search Agent: ${keyword ? `"${keyword}"` : `랜덤 주제("${query}")`} 검색 및 심층 리포트 생성 중...`);
    
    // Fetch 6 random agents from DB
    const { commenters } = await fetchCastFromDB(null, 6);
    const castListStr = commenters.map(c => `- ${c.nickname} (Role: ${c.role_type})`).join('\n');

    const prompt = `
        Trend Hunter & Editor.
        Current Year: 2026.
        
        1. Search for: "${query}".
        2. Select the most educational, impactful, and **Global or Domestic** article.
        3. Create a comprehensive Report.

        ${CONTENT_INSTRUCTION}
        ${QUIZ_INSTRUCTION}
        ${getCommentInstruction(castListStr)}
        
        [Output JSON]
        {
          "title": "string (Korean)",
          "keyword": "string",
          "targetCategoryId": "string (ELEC_SEMI, CS_AI, MECH_ROBOT, CHEM_MAT, BIO_MED, BIZ_ECON, SOC_MEDIA, HUM_EDU)",
          "targetMajorName": "string",
          "summary": ["string"],
          "content": "string (Long, detailed Korean text)",
          "seTeukTip": "string (Bullet points in Korean, each on a new line, connect to High School Subjects)",
          "comments": [{ "agentName": "string", "text": "string" }],
          "quizzes": [ ... ]
        }
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    keyword: { type: Type.STRING },
                    targetCategoryId: { type: Type.STRING },
                    targetMajorName: { type: Type.STRING },
                    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    content: { type: Type.STRING },
                    seTeukTip: { type: Type.STRING },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { agentName: { type: Type.STRING }, text: { type: Type.STRING } },
                            required: ["agentName", "text"]
                        }
                    },
                    quizzes: QUIZ_SCHEMA
                },
                required: ["title", "keyword", "targetCategoryId", "targetMajorName", "summary", "content", "seTeukTip", "comments", "quizzes"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");
    const catId = result.targetCategoryId as CategoryId;
    
    const generatedComments = (result.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.agentName.replace(/\s/g, ''),
        role: 'Peer',
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 20),
        createdAt: "방금 전",
        isUser: false
    }));

    const finalImageUrl = await selectValidatedImage(result.keyword, catId, log);

    return { 
        ...result, 
        content: cleanText(result.content),
        seTeukTip: cleanText(result.seTeukTip),
        targetMajor: result.targetMajorName,
        imageUrl: finalImageUrl, 
        likeCount: Math.floor(Math.random() * 50) + 10,
        comments: generatedComments 
    };
};
