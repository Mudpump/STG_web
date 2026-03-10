
import { Type } from "@google/genai";
import { CategoryId, Post, Comment } from '../types';
import { ai, MODEL_NAME, cleanText } from './utils';
import { PROFESSORS, MAJOR_DETAILS } from '../constants';
import { GRADE_SUBJECTS } from '../utils/curriculumData';

export type ProfessorTheme =
    | 'ROADMAP'      // 1. 전공별 3년 로드맵 (Matrix)
    | 'PINPOINT'     // 2. 교과서 단원 핀포인트 매칭
    | 'METHODOLOGY'  // 3. 현실 탐구 방법론 (방구석/현장)
    | 'CLINIC'       // 4. 망한 주제 심폐소생술
    | 'TRANSLATION'  // 5. 탐구보고서 말투 세탁소
    | 'CROSSOVER'    // 6. 미친 융합
    | 'CUSTOM';      // 관리자 직접 지시

export async function runProfessorAgent(
    professorId: string,
    theme: ProfessorTheme,
    instruction: string,
    log: (msg: string) => void
): Promise<Post> {
    const professor = PROFESSORS.find(p => p.id === professorId);
    if (!professor) throw new Error("Professor not found");

    const majorInfo = MAJOR_DETAILS[professor.title] || MAJOR_DETAILS[professor.categoryId];

    log(`👨‍🏫 Professor Agent: [${professor.name}] 교수님이 [${theme}] 테마로 집필을 시작합니다...`);

    // --- 6대 탐구 프레임워크 정의 (학년별 서사 매핑 버전) ---
    const FRAMEWORKS = {
        DMS: `
        **[Scientific Model: D.M.S (Discovery - Mechanism - Solution)]**
        "현상은 왜 발생하는가? 원리를 규명하고 기술로 제어하라."
        This model strictly maps to the 3-year roadmap:
        - **Grade 1 (Discovery):** Finding curiosity in textbooks/daily life. (Problem Recognition)
        - **Grade 2 (Mechanism):** Deep analysis of principles using experiments/papers. (Analytic Ability)
        - **Grade 3 (Solution):** Proposing engineering/technical solutions. (Problem Solving)
        `,
        QMI: `
        **[Logical Model: Q.M.I (Quantification - Modeling - Insight)]**
        "세상을 숫자로 번역하라. 데이터로 미래를 최적화하라."
        This model strictly maps to the 3-year roadmap:
        - **Grade 1 (Quantification):** Collecting data from daily observations (e.g., cafeteria waste). (Mathematical Sensitivity)
        - **Grade 2 (Modeling):** Building functions/statistical models to explain variables. (Logical Reasoning)
        - **Grade 3 (Insight):** Proposing optimization strategies or predictions based on the model. (Application)
        `,
        CDA: `
        **[Social Model: C.D.A (Conflict - Debate - Advocacy)]**
        "갈등의 이면을 파헤쳐라. 논리로 옹호하고 제도로 해결하라."
        This model strictly maps to the 3-year roadmap:
        - **Grade 1 (Conflict):** Identifying social issues/conflicts in news or textbooks. (Problem Awareness)
        - **Grade 2 (Debate):** Analyzing from conflicting perspectives (Pros/Cons, Theory A vs B). (Multidimensional Thinking)
        - **Grade 3 (Advocacy):** Proposing amendments, guidelines, or social agreements. (Solution Proposal)
        `,
        HRC: `
        **[Humanistic Model: H.R.C (Heritage - Reinterpretation - Creation)]**
        "오래된 텍스트를 읽고, 현대의 언어로 다시 써라."
        This model strictly maps to the 3-year roadmap:
        - **Grade 1 (Heritage):** Deep reading of classics/history to understand context & intent. (Literacy)
        - **Grade 2 (Reinterpretation):** Applying the text to modern issues (AI, Inequality) for critical analysis. (Critical Thinking)
        - **Grade 3 (Creation):** Creating new value/content/campaigns based on the reinterpretation. (Creative Expression)
        `,
        VIP: `
        **[Perspective Model: V.I.P (Viewpoint - Interpretation - Persona)]**
        "전공의 안경을 쓰고 대상을 바라보라." (Used for Non-Major Subjects)
        - **Logic:** Viewpoint(전공의 눈) -> Interpretation(태도 해석) -> Persona(가치관)
        - Focus on showing the *Attitude* of the major, not just knowledge.
        `,
        BSL: `
        **[Base Model: B.S.L (Base - Soft-Link - Learning)]**
        "전공 생각은 잠시 끄고, 공부 잘하는 학생(Academic Capability)임을 증명한다."
        - **Target:** Basic subjects (History, PE, Music) where 'Basic Literacy' is key.
        - **Logic:** Base(교과 성실도) -> Soft-Link(느슨한 연결) -> Learning(학업 역량)
        - **Base:** Faithfully investigating the subject's core concepts without forcing major connection.
        - **Soft-Link:** Briefly mentioning a connection to the major without being obsessive.
        - **Learning:** Emphasizing literacy, analytical skills, and research attitude.
        `
    };

    // --- 프레임워크 할당 로직 (Priority: Theme > ID > Category) ---
    let frameworkLogic = "";
    let selectedModelName = "";

    // 1. Theme Priority
    if (theme === 'CROSSOVER') {
        frameworkLogic = FRAMEWORKS.VIP; // 융합 테마는 무조건 VIP
        selectedModelName = "VIP";
    }
    // 2. Specific Professor Overrides (Pinpoint IDs)
    else if (['prof-ind', 'prof-lib', 'prof-stat', 'prof-biz-2', 'prof-cs', 'prof-math'].includes(professor.id)) {
        frameworkLogic = FRAMEWORKS.QMI;
        selectedModelName = "QMI";
    }
    else if (['prof-soc', 'prof-psy'].includes(professor.id)) {
        frameworkLogic = FRAMEWORKS.CDA;
        selectedModelName = "CDA";
    }
    else if (professor.id === 'prof-biz-1') {
        frameworkLogic = FRAMEWORKS.QMI;
        selectedModelName = "QMI";
    }
    // 3. Category Defaults
    else if (['HUM_EDU'].includes(professor.categoryId)) {
        frameworkLogic = FRAMEWORKS.HRC;
        selectedModelName = "HRC";
    } else if (['BIZ_ECON'].includes(professor.categoryId)) {
        frameworkLogic = FRAMEWORKS.QMI;
        selectedModelName = "QMI";
    } else if (['SOC_MEDIA'].includes(professor.categoryId)) {
        frameworkLogic = FRAMEWORKS.CDA;
        selectedModelName = "CDA";
    } else {
        // Natural Sciences & Engineering (ELEC, MECH, CHEM, BIO)
        frameworkLogic = FRAMEWORKS.DMS;
        selectedModelName = "DMS";
    }

    // --- Define Prompt per Theme ---
    let themePrompt = "";

    switch (theme) {
        case 'ROADMAP':
            themePrompt = `
                [Theme: 1. 3-Year Narrative Growth Roadmap]
                - **Goal**: Design a dramatic growth narrative: **[Curiosity -> Theoretical Analysis -> Real-world Solution]**.
                - **Core Strategy**: The "Limitation" of the previous grade triggers the "Motivation" for the next.
                - **Framework Application**: Apply the **${selectedModelName}** logic to each grade's narrative structure.

                [Subject Selection Rule]
                - **2022 Revised Curriculum Subjects**: You MUST ONLY select from the following subjects for each grade:
                  - **Grade 1 (H1)**: ${GRADE_SUBJECTS['H1'].join(', ')}
                  - **Grade 2 (H2)**: ${GRADE_SUBJECTS['H2'].join(', ')}
                  - **Grade 3 (H3)**: ${GRADE_SUBJECTS['H3'].join(', ')}
                - **Quantity**: Select **3 DISTINCT subjects** for EACH grade (Total 9 activities).
                - **Balance**: Mix **Quantitative** (Math, Science, Data, Logic) and **Qualitative** (Ethics, Social, Literature, People) subjects.
                  - *Example (Business):* 경제 (Money) + 실용통계 (Data) + 문학/생활과윤리 (People/Organization).
                  - *Example (Engineering):* 물리학 (Theory) + 정보 (Tool) + 사회문제 탐구 (Tech Ethics).
                  - *Example (Humanities):* 한국사 (Text) + 통합사회 (Context) + 인공지능 기초 (Evidence).

                [Structure Requirements based on ${selectedModelName}]

                **1. Grade 1: The Trigger (Discovery & Thirst)**
                - **Logic**: Apply the **1st letter** of ${selectedModelName}.
                - **Narrative**: Start with curiosity from daily life, news, or textbooks.
                - **Ending**: Conclude with a **"Knowledge Gap"**. "I understood the phenomenon, but lacked the professional theory to prove the 'Why'."

                **2. Grade 2: The Deep Dive (Analysis & The Reality Wall)**
                - **Logic**: Apply the **2nd letter** of ${selectedModelName}.
                - **Narrative**: Use major-specific theories to analyze the G1 topic.
                - **CRITICAL**: Do NOT end with a perfect solution. You MUST face a **"Real-world Limitation"**.
                  - *Logic:* "Theoretically perfect, but in reality, variables like [Cost/Ethics/Efficiency/Complexity] make it impossible to solve with just theory."
                  - This "Failure/Limitation" is the motivation for Grade 3.

                **3. Grade 3: The Convergence (Breakthrough)**
                - **Logic**: Apply the **3rd letter** of ${selectedModelName}.
                - **Narrative**: Overcome the G2 limitation by bringing in a **New Tool** (AI, Advanced Math, Big Data, or Philosophical Insight).
                - **Result**: Propose a concrete solution (Model, Policy, Algorithm) that solves the real-world problem. 1학년, 2학년의 주제를 3학년에 확장된 개념 또는 더 세밀한 개념으로 통합해서 탐구의 연결성 확보

                [Formatting Rules]
                - **Show, Don't Tell**: NEVER mention internal framework names (DMS, QMI, etc.) or terms like "Limitation", "Linkage" in the output text.
                - **Headers**: Use creative, descriptive headers relevant to the content. (e.g., "## [1학년] 일상 속의 발견", "## [2학년] 데이터로 검증한 가설", "## [3학년] 기술과 윤리의 공존").
                - **Bridge Comments**: Between Grade 1&2 and Grade 2&3, insert a specialized block:
                  > 🔻 ** 추가의견: ** [Professor's bridging narration connecting the previous limitation to the next step. 분석적이고 차분한 어조이며, 해당 학년을 한계를 다음에는 어떻게 발전시켜 보자는 어조]
                - **Content Item Format**: For each subject, use strictly this format: 각 subject가 끝나면 enter을 통해 줄바꿈 넣기:
                  - **과목:** [Subject Name]
                  - **탐구주제:** [Topic Title]
                  - **활동요약:** [Concise summary of the activity/experiment/research(고등학생이 접근하기 용이한 주제)]
                  - **향후계획/총평:** [The narrative significance. Explicitly mention the **'Limitation'** found or the **'Motivation'** gained. Highlight keywords like **'한계'**, **'현실적 변수'**, **'필요성'** with Markdown Bold, 1학년때 한계와 동기를 이용해서 2학년때 주제를 잡았다는 내용, 1학년 2학년의 과정을 종합해서 3학년에서 해결하는 모습].
            `;
            break;
        case 'PINPOINT':
            themePrompt = `
                [Theme: 2. Textbook Unit Pinpoint Matching]
                - Target a specific unit in a high school textbook.
                - Suggest a specific performance assessment (Se-Teuk) topic.
                - Apply the **${selectedModelName}** logic to deepen the topic.
            `;
            break;
        case 'METHODOLOGY':
            themePrompt = `
                [Theme: 3. Realistic Research Methodology]
                - Suggest a concrete research method accessible to high school students.
                - Focus on the **2nd Step (Mechanism/Modeling/Debate)** of the ${selectedModelName} model.
                - Provide a step-by-step guide.
            `;
            break;
        case 'CLINIC':
            themePrompt = `
                [Theme: 4. Topic Clinic (Before & After)]
                - Show a "Before" example (Weak topic).
                - Show an "After" example (Strong topic applied with ${selectedModelName} logic).
                - Explain WHY the 'After' is better using the framework's core values.
            `;
            break;
        case 'TRANSLATION':
            themePrompt = `
                [Theme: 5. Report Wording Translation]
                - Upgrade student language to academic researcher language.
                - Use terms relevant to ${majorInfo.id}.
            `;
            break;
        case 'CROSSOVER':
            themePrompt = `
                [Theme: 6. Unexpected Fusion (Crossover)]
                - Connect a subject unrelated to the major using the **V.I.P Model**.
                - Viewpoint -> Interpretation -> Persona.
                - Show the "Attitude" of a researcher.
            `;
            break;
        case 'CUSTOM':
            themePrompt = `
                [Theme: Custom Instruction]
            `;
            break;
    }

    // [MODIFIED] Instruction Injection Logic
    const instructionBlock = instruction ? `
    **[USER ADDITIONAL INSTRUCTION]**
    The user has provided a specific constraint/instruction for this generation. 
    You MUST incorporate this into your content while maintaining the selected Theme structure:
    "${instruction}"
    ` : "";

    const mainPrompt = `
        You are **Professor ${professor.name}** (${professor.title}).
        Your Persona: ${professor.title} 전공으로, 해당전공의 연구 및 산업 분야 진로에 대해 박학다식한 사람하며 이 분야 세계 최고이다. 그 중 하나의 산업 및 연구 분야를 선택해서 아래의 지시사항을 이행하시오. 또한 전공뿐만 아니라 고등학생 멘토 분야에서도 두각을 나타내며, 주요 진로와 연계된 로드맵 수립의 대가이다.
        Target Audience: High School Students aiming for your major.
        Current Year: 2026.
        Language: Korean (Professional, Authoritative but Mentoring tone).

        ${frameworkLogic}

        ${themePrompt}

        ${instructionBlock}

        [Output JSON Structure]
        {
            "title": "Catchy Title including the main topic (Do NOT include '2026' in the title)",
            "content": "Long, detailed post content. **IMPORTANT: Do NOT use Markdown syntax (no ##, **, tables, etc.). Write in PLAIN TEXT. Use line breaks (enter) frequently to separate paragraphs clearly for readability.**",
            "tags": ["string", "string"]
        }
    `;

    // 2. Generate Post Content
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: mainPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "content", "tags"]
            }
        }
    });

    const postResult = JSON.parse(response.text || "{}");
    log(`✅ 본문 생성 완료: ${postResult.title}`);

    // 3. Generate Grad Student Comments
    log(`🎓 Grad Students: 석/박사 조교들이 댓글을 달고 있습니다...`);

    const commentPrompt = `
        Context: Professor ${professor.name} wrote a post about "${postResult.title}".
        Content Summary: ${postResult.content.substring(0, 300)}...
        
        You are a **Group of Graduate Students (Masters/PhD)** in this lab.
        Your Role: Help high school students understand the professor's high-level advice.
        
        [Directives]
        1. **Simplify**: If the professor's talk is too hard, explain it simply.
        2. **Practical Tips**: Give realistic tips on how to do the experiments or find data (e.g., "툴 소개 금지, 데이터 이름은 명시해도 되나 데이터 출처 소개 지양"), 교수님이 제시한 실험이 있다면 고교 수준에서 좀 더 쉽게할 수 있는 방법론 제시 
        3. **Support**: Encourage the students.
        4. **Tone**: Polite but friendly "Sunbae" (Senior) tone. Use terms like "교수님 말씀은~", "현실적으로는~".
        
        Generate 3-4 comments.
        
        [Output JSON]
        {
            "comments": [
                { "role": "PhD", "nickname": "김박사과정", "text": "..." },
                { "role": "Masters", "nickname": "이석사", "text": "..." }
            ]
        }
    `;

    const commentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: commentPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                role: { type: Type.STRING },
                                nickname: { type: Type.STRING },
                                text: { type: Type.STRING }
                            },
                            required: ["role", "nickname", "text"]
                        }
                    }
                },
                required: ["comments"]
            }
        }
    });

    const commentResult = JSON.parse(commentResponse.text || "{}");

    // 4. Format & Return
    const formattedComments: Comment[] = (commentResult.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.nickname,
        role: c.role === 'PhD' ? 'Assistant' : 'Mentor', // Map to existing UI roles or generic
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 20),
        createdAt: `${idx + 1}분 전`,
        isUser: false
    }));

    return {
        id: Date.now().toString(),
        categoryId: professor.categoryId,
        authorAgent: professor.name,
        authorRole: 'Professor',
        title: cleanText(postResult.title),
        content: cleanText(postResult.content),
        previewText: cleanText(postResult.content).substring(0, 80) + '...',
        comments: formattedComments,
        viewCount: Math.floor(Math.random() * 500) + 100,
        likeCount: Math.floor(Math.random() * 100) + 20,
        createdAt: '방금 전',
        tags: postResult.tags || ['교수님픽', majorInfo.id],
        isUser: false,
        targetGrade: 'ALL'
    };
}
