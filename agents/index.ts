
import { Type } from "@google/genai";
import { Post, GradeType, CategoryId } from '../types';
import { runAgentA, runAgentB, runAgentC, runAgentM } from './feedAgents';
import { runProfessorAgent } from './professorAgents'; 
import { runCounselingAgent } from './counselingAgents'; // New Import
import { fetchCastFromDB, ai, MODEL_NAME, cleanText } from './utils';

// Export all specific agents
export { runTrendAgents, runSourceTrendAgents, runSearchTrendAgents } from './trendAgents';
export { runVoteAgents } from './voteAgents';
export { runProfessorAgent } from './professorAgents';
export { runCounselingAgent } from './counselingAgents'; // New Export

// --- Pipeline Functions ---

export const runAgentChain = async (
    currentPosts: Post[], 
    targetGrade: GradeType, 
    targetMonth: number, 
    keyword: string, 
    logCallback: (msg: string) => void,
    forcedCategoryId?: CategoryId // Added parameter
): Promise<Post> => {
    // 1. Agent A (Topic Scout)
    const topicData = await runAgentA(currentPosts, targetGrade, targetMonth, keyword, logCallback, forcedCategoryId);
    
    // 2. Fetch Cast
    const { author, commenters } = await fetchCastFromDB(topicData.targetCategory, 8);
    
    // 3. Agent B (Scenario Writer) - First Draft
    let scenarioData = await runAgentB(topicData, author, commenters, logCallback);

    // 4. Agent M (Mentor/Reviewer) - Evaluation Loop
    const review = await runAgentM(scenarioData, logCallback);
    
    if (review.decision === 'REJECT') {
        logCallback(`⚠️ 멘토 반려: "${review.feedback}" -> 수정 작업 착수`);
        // Retry Agent B with feedback
        scenarioData = await runAgentB(topicData, author, commenters, logCallback, review.feedback);
        logCallback(`✅ 수정 완료. 스케줄링 진행.`);
    } else {
        logCallback(`✅ 멘토 승인. 스케줄링 진행.`);
    }

    // 5. Agent C (Scheduler)
    const finalPost = runAgentC(scenarioData, topicData.targetCategory, author, topicData.gradeKey as GradeType, logCallback);
    return finalPost;
};

export const runCustomAgentChain = async (
    customGuide: { major: string, grade: GradeType, instruction: string }, 
    logCallback: (msg: string) => void
): Promise<Post> => {
    logCallback(`🤖 Custom Agent: [${customGuide.major}] - [${customGuide.grade}] 가이드 분석 중...`);

    const prompt = `
        You are a Student Record Consultant.
        Create a research topic based on this guide.
        [Input] Major: ${customGuide.major}, Grade: ${customGuide.grade}, Instruction: "${customGuide.instruction}"
        
        [Output JSON]
        {
             "topicTitle": "string",
             "topicDescription": "string",
             "tags": ["string"],
             "targetCategoryId": "string (One of: ELEC_SEMI, CS_AI, MECH_ROBOT, CHEM_MAT, BIO_MED, BIZ_ECON, SOC_MEDIA, HUM_EDU)"
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
                    topicTitle: { type: Type.STRING },
                    topicDescription: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    targetCategoryId: { type: Type.STRING }
                },
                required: ["topicTitle", "topicDescription", "tags", "targetCategoryId"]
            }
        }
    });

    const topicPlan = JSON.parse(response.text || "{}");
    const categoryId = (topicPlan.targetCategoryId || 'ALL') as CategoryId;
    logCallback(`🎯 주제 확정: ${topicPlan.topicTitle}`);

    const { author, commenters } = await fetchCastFromDB(categoryId, 6);
    const topicData = { ...topicPlan, gradeKey: customGuide.grade };

    // Initial Draft
    let scenarioData = await runAgentB(topicData, author, commenters, logCallback);

    // Review Loop
    const review = await runAgentM(scenarioData, logCallback);
    if (review.decision === 'REJECT') {
        logCallback(`⚠️ 멘토 반려: "${review.feedback}" -> 수정 작업 착수`);
        scenarioData = await runAgentB(topicData, author, commenters, logCallback, review.feedback);
        logCallback(`✅ 수정 완료.`);
    } else {
        logCallback(`✅ 멘토 승인.`);
    }

    return runAgentC(scenarioData, categoryId, author, customGuide.grade, logCallback);
};

// --- ROADMAP Pipeline ---
export const runRoadmapAgentChain = async (
    categoryId: CategoryId,
    majorName: string,
    instruction: string,
    logCallback: (msg: string) => void
): Promise<Post> => {
    logCallback(`🛣️ Roadmap Agent: [${majorName}] 3년치 성장 로드맵 설계 중...`);

    // 1. Roadmap Planning
    const planPrompt = `
        You are an elite high school admissions consultant.
        Create a "3-Year Growth Roadmap" for a student applying to: ${majorName}.
        Category: ${categoryId}.
        
        [Guidelines]
        - Grade 1 (H1): Curiosity triggered by daily life or basic subjects. "Why?"
        - Grade 2 (H2): Deep dive using specific tools (Statistics, Coding, Experiments). "How to prove?"
        - Grade 3 (H3): Advanced fusion/social problem solving. "So what?"
        - Mix subjects (e.g. Math + Social Studies).
        - **Current Year**: 2026.

        [User Instruction]
        "${instruction || 'None'}"
        - **IMPORTANT**: If provided, this instruction is the KEY constraint. The roadmap must revolve around this theme or subject requirement.
        
        [Output JSON]
        {
            "title": "Catchy Title for the Post (e.g. [Roadmap] ...) (Do NOT include '2026')",
            "h1_theme": "Grade 1 Activity & Subject",
            "h2_theme": "Grade 2 Activity & Subject",
            "h3_theme": "Grade 3 Activity & Subject",
            "intro": "Short intro by the student",
            "tags": ["string"]
        }
    `;

    const planResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: planPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    h1_theme: { type: Type.STRING },
                    h2_theme: { type: Type.STRING },
                    h3_theme: { type: Type.STRING },
                    intro: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "h1_theme", "h2_theme", "h3_theme", "intro", "tags"]
            }
        }
    });

    const plan = JSON.parse(planResponse.text || "{}");
    logCallback(`📍 로드맵 설계 완료: 1학년(${plan.h1_theme.substring(0,10)}...)`);

    // 2. Fetch Cast (Need more commenters)
    const { author, commenters } = await fetchCastFromDB(categoryId, 12);

    // 3. Script Writing - Direct generation without Agent B abstraction for Roadmap specialized prompts
    const scriptPrompt = `
        You are a screenwriter for a student community.
        **Current Year: 2026.**
        
        [Roadmap Info]
        - Title: ${plan.title}
        - Major: ${majorName}
        - H1: ${plan.h1_theme}
        - H2: ${plan.h2_theme}
        - H3: ${plan.h3_theme}
        - Intro: ${plan.intro}
        
        [Cast] ${author.nickname} (Author), ${commenters.map(c => c.nickname).join(', ')}
        
        [Task]
        1. Write the **Post Content**.
           - Author shares their "Master Plan" to help juniors.
           - Structure clearly with [고1], [고2], [고3] headers.
           - Tone: Helpful senior (Banmal).
        2. Write **10-12 Comments**.
           - **CRITICAL**: Include "Realistic Experimental Advice" in at least 3 comments.
             (e.g., "Don't use X, use Y", "Read paper Z", "Use this Python library").
           - **Use 2026 Tech**: Mention modern tools (e.g., Gemini, DeepL, Notion AI, Vercel) instead of old ones (Papago).
           - Create a "Tiki-Taka" flow.
        
        [Output JSON]
        {
          "postContent": "string",
          "comments": [{ "agentName": "string", "text": "string" }]
        }
    `;

    const scriptResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: scriptPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    postContent: { type: Type.STRING },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                agentName: { type: Type.STRING },
                                text: { type: Type.STRING }
                            },
                            required: ["agentName", "text"]
                        }
                    }
                },
                required: ["postContent", "comments"]
            }
        }
    });

    const script = JSON.parse(scriptResponse.text || "{}");

    // 4. Format
    const scenarioData = {
        post: {
            title: cleanText(plan.title),
            content: cleanText(script.postContent),
            tags: [...plan.tags, '로드맵', '합격비법']
        },
        comments: script.comments.map((c: any) => ({ ...c, text: cleanText(c.text) }))
    };

    // Apply Mentor review to Roadmap
    const review = await runAgentM(scenarioData, logCallback);
    if (review.decision === 'REJECT') {
         logCallback(`⚠️ 멘토 반려(로드맵): "${review.feedback}" -> 재생성 (단순 재생성)`);
         logCallback(`ℹ️ 로드맵은 구조상 자동 수정이 어렵습니다. 멘토 의견을 참고하여 다음 생성 시 반영됩니다.`);
    } else {
        logCallback(`✅ 멘토 승인.`);
    }

    return runAgentC(scenarioData, categoryId, author, 'H1', logCallback); 
};
