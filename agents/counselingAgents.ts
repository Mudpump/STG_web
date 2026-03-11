
import { Type } from "@google/genai";
import { Post, Comment, Agent } from '../types';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';
import { PROFESSORS } from '../constants';
import { GRADE_SUBJECTS } from '../utils/curriculumData';

// 상담 유형 감지 헬퍼
function detectCounselingType(content: string): 'ROADMAP' | 'CONNECTION' | 'SOLUTION' | 'GENERAL' {
    if (content.includes('로드맵 설계형')) return 'ROADMAP';
    if (content.includes('세특 꼬꼬무')) return 'CONNECTION';
    if (content.includes('주제 팩트체크/솔루션형')) return 'SOLUTION';
    return 'GENERAL';
}

export async function runCounselingAgent(
    post: Post,
    adminInstruction: string,
    log: (msg: string) => void
): Promise<{ professorComment: string, assistantComments: { name: string, text: string }[] }> {

    // 1. 교수 정보 찾기
    const professorId = post.targetProfessorId;
    const professor = PROFESSORS.find(p => p.id === professorId);

    if (!professor) {
        throw new Error("대상 교수님을 찾을 수 없습니다.");
    }

    const counselingType = detectCounselingType(post.content);
    log(`🩺 상담 에이전트: [${professor.name}] 교수님이 [${counselingType}] 유형을 분석 중입니다...`);

    // 2. 조교 캐스팅 (2명)
    const { commenters: assistants } = await fetchCastFromDB(professor.categoryId, 2);
    const assistantNames = assistants.map(a => a.nickname).join(', ');

    // 3. 프롬프트 구성 (유형별 분기)
    let specificInstruction = "";

    // --- 6대 탐구 프레임워크 정의 (Counseling용) ---
    const FRAMEWORKS = {
        DMS: `
        **[Scientific Model: D.M.S (Discovery - Mechanism - Solution)]**
        "현상은 왜 발생하는가? 원리를 규명하고 기술로 제어하라."
        - **Grade 1 (Discovery):** Finding curiosity in textbooks/daily life. (Problem Recognition)
        - **Grade 2 (Mechanism):** Deep analysis of principles using experiments/papers. (Analytic Ability)
        - **Grade 3 (Solution):** Proposing engineering/technical solutions. (Problem Solving)
        `,
        QMI: `
        **[Logical Model: Q.M.I (Quantification - Modeling - Insight)]**
        "세상을 숫자로 번역하라. 데이터로 미래를 최적화하라."
        - **Grade 1 (Quantification):** Collecting data from daily observations. (Mathematical Sensitivity)
        - **Grade 2 (Modeling):** Building functions/statistical models. (Logical Reasoning)
        - **Grade 3 (Insight):** Proposing optimization strategies or predictions. (Application)
        `,
        CDA: `
        **[Social Model: C.D.A (Conflict - Debate - Advocacy)]**
        "갈등의 이면을 파헤쳐라. 논리로 옹호하고 제도로 해결하라."
        - **Grade 1 (Conflict):** Identifying social issues/conflicts. (Problem Awareness)
        - **Grade 2 (Debate):** Analyzing from conflicting perspectives. (Multidimensional Thinking)
        - **Grade 3 (Advocacy):** Proposing amendments or social agreements. (Solution Proposal)
        `,
        HRC: `
        **[Humanistic Model: H.R.C (Heritage - Reinterpretation - Creation)]**
        "오래된 텍스트를 읽고, 현대의 언어로 다시 써라."
        - **Grade 1 (Heritage):** Deep reading of classics/history. (Literacy)
        - **Grade 2 (Reinterpretation):** Applying the text to modern issues. (Critical Thinking)
        - **Grade 3 (Creation):** Creating new value/content based on reinterpretation. (Creative Expression)
        `,
        VIP: `
        **[Perspective Model: V.I.P (Viewpoint - Interpretation - Persona)]**
        "전공의 안경을 쓰고 대상을 바라보라."
        - **Logic:** Viewpoint(전공의 눈) -> Interpretation(태도 해석) -> Persona(가치관)
        `,
        BSL: `
        **[Base Model: B.S.L (Base - Soft-Link - Learning)]**
        "전공 생각은 잠시 끄고, 공부 잘하는 학생(Academic Capability)임을 증명한다."
        `
    };

    // --- 프레임워크 할당 로직 ---
    let frameworkLogic = "";
    let selectedModelName = "";

    // 1. Specific Professor Overrides
    if (['prof-ind', 'prof-lib', 'prof-stat', 'prof-biz-2', 'prof-cs', 'prof-math'].includes(professor.id)) {
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
    // 2. Category Defaults
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
        // Natural Sciences & Engineering
        frameworkLogic = FRAMEWORKS.DMS;
        selectedModelName = "DMS";
    }

    if (counselingType === 'ROADMAP') {
        specificInstruction = `
        [Type: 🚀 3-Year Narrative Growth Roadmap]
        
        **Goal**: Design a dramatic growth narrative tailored to the student's request: **[Curiosity -> Theoretical Analysis -> Real-world Solution]**.
        **Essential Requirement**: Extract the core interests and keywords from the [Student's Question]. The roadmap MUST use these interests as the starting point for Grade 1 and the ultimate goal for Grade 3.
        **Core Strategy**: The "Limitation" of the previous grade triggers the "Motivation" for the next.
        **Framework Application**: Apply the **${selectedModelName}** logic to each grade's narrative structure.

        [Subject Selection Rule]
        - **2022 Revised Curriculum Subjects**: You MUST ONLY select from the following subjects for each grade:
          - **Grade 1 (H1)**: ${GRADE_SUBJECTS['H1'].join(', ')}
          - **Grade 2 (H2)**: ${GRADE_SUBJECTS['H2'].join(', ')}
          - **Grade 3 (H3)**: ${GRADE_SUBJECTS['H3'].join(', ')}
        - **[CRITICAL: STRICT NAME MATCHING]**: You MUST use the EXACT subject name as provided in the lists above. Do NOT abbreviate, interpret, or hallucinate subject names (e.g., Do NOT write "물리1" or "물리Ⅰ" if the list says "물리학". Do NOT write "미적분1" if the list says "미적분Ⅰ").
        - **Quantity**: Select **2-3 DISTINCT subjects** for EACH grade.
        - **Contextual Linkage**: Ensure that the chosen subject perfectly matches the narrative you are building. The activity MUST be realistically achievable within that specific subject's curriculum.

        ${frameworkLogic}

        [Structure Requirements based on ${selectedModelName}]
        
        **1. Grade 1: The Trigger (Discovery & Thirst)**
        - **Logic**: Apply the **1st letter** of ${selectedModelName}.
        - **Narrative**: Start with curiosity from daily life, news, or textbooks related to the student's interest. Directly incorporate the student's question keywords here.
        - **Ending**: Conclude with a **"Knowledge Gap"**. "I understood the phenomenon, but lacked the professional theory to prove the 'Why'."
        - **level**: 고등학교 1학년 학생이 탐구할 수 있는 수준의 아이디어 제시하세요. 절대, 대학교, 대학원 수준으로 제시하면 안됩니다.

        **2. Grade 2: The Deep Dive (Analysis & The Reality Wall)**
        - **Logic**: Apply the **2nd letter** of ${selectedModelName}.
        - **Narrative**: Use major-specific theories to analyze the G1 topic.
        - **CRITICAL**: Do NOT end with a perfect solution. You MUST face a **"Real-world Limitation"**.
            - *Logic:* "Theoretically perfect, but in reality, variables like [Cost/Ethics/Efficiency/Complexity] make it impossible to solve with just theory."
            - This "Failure/Limitation" is the motivation for Grade 3.
        - **level**: 고등학교 2학년 학생이 탐구할 수 있는 수준의 아이디어 제시하세요. 절대, 대학교, 대학원 수준으로 제시하면 안됩니다.

        **3. Grade 3: The Convergence (Breakthrough)**
        - **Logic**: Apply the **3rd letter** of ${selectedModelName}.
        - **Narrative**: Overcome the G2 limitation by bringing in a **New Tool** (AI, Advanced Math, Big Data, or Philosophical Insight) to solve the student's original interest area.
        - **Result**: Propose a concrete solution (Model, Policy, Algorithm) that solves the real-world problem. 1학년, 2학년의 주제를 3학년에 확장된 개념 또는 더 세밀한 개념으로 통합해서 탐구의 연결성 확보.
        - **level**: 고등학교 3학년 학생이 탐구할 수 있는 수준의 아이디어 제시하세요. 절대, 대학교, 대학원 수준으로 제시하면 안됩니다.


        [Formatting Rules]
        - **Show, Don't Tell**: NEVER mention internal framework names (DMS, QMI, etc.) or terms like "Limitation", "Linkage" in the output text.
        - **Tone**: Detailed, strategic, and visionary. Explain *WHY* this flow is necessary for their specific major, tying it back to the student's original question.
        - **Headers**: Use clear headers for each grade (e.g., "## [1학년] ...").
        - **Bridge Comments**: Between Grade 1&2 and Grade 2&3, insert a specialized block:
          > 🔻 ** 추가의견: ** [Professor's bridging narration connecting the previous limitation to the next step. 분석적이고 차분한 어조이며, 해당 학년을 한계를 다음에는 어떻게 발전시켜 보자는 어조]
        - **Content Item Format**: For each subject, use strictly this format. 각 subject가 끝나면 마크다운 형식의 줄바꿈 넣기:
           - **과목:** [Subject Name]
           - **탐구주제:** [Topic Title]
           - **활동요약:** [Concise summary of the activity/experiment/research(고등학생이 접근하기 용이한 주제)]
           - **향후계획(아이디어):** [The narrative significance. Explicitly mention the **'Limitation'** found or the **'Motivation'** gained. Highlight keywords like **'한계'**, **'현실적 변수'**, **'필요성'** with Markdown Bold. 1학년때 한계와 동기를 이용해서 2학년때 주제를 잡았다는 내용, 1학년 2학년의 과정을 종합해서 3학년에서 해결하는 모습].
        `;
    } else if (counselingType === 'CONNECTION') {
        specificInstruction = `
        [Type: 🔗 Record Connection (세특 꼬꼬무)]
        
        **Goal**: Design deep exploration topics that seamlessly connect the student's previous activity (based on their raw student record) to their new Target Subject.
        
        **Core Strategy**: 
        1. **Fact & Competency Extraction**: Analyze the '세특 원문' (Previous Activity Record) to identify the specific actions the student took and the exact competencies they demonstrated (e.g., problem-solving, data analysis).
        2. **Cross-over Mapping**: Find the logical intersection between their previous competencies and the '타겟 과목' (Target Subject). 
           - **CRITICAL**: Check the '타겟 단원명 힌트' (Target Chapter Hints). If chapters are listed, your proposed topics MUST strictly align with at least one of these chapters. Do not hallucinate curriculum content. If it says '없음', rely on the general nature of the Target Subject.
        3. **Actionable Theme Generation**: Propose exactly 3 highly specific exploration topics: [심화형(Deepening)], [융합형(Crossover)], and [적용형(Action-oriented)].

        [Formatting Rules]
        - **Tone**: Logical, cohesive, deepening, and expert mentorship.
        - **Headers**: Use markdown headers for structure.
        - **Content Output Requirements**:
            - **1. 이전 역량 분석**: Briefly summarize the core competency found in the raw student record.
            - **2. 연계 탐구솔루션 제안**:
                - **[제안 1 - 심화형]**: Topic name and specific step-by-step activity guide. (Must explicitly link to the target chapters if provided).
                - **[제안 2 - 융합형]**: Topic name and specific step-by-step activity guide. (Must explicitly link to the target chapters if provided).
                - **[제안 3 - 적용 및 실천형]**: Topic name and specific step-by-step activity guide. (Must explicitly link to the target chapters if provided).
        `;
    } else if (counselingType === 'SOLUTION') {
        specificInstruction = `
        [Type: 💡 Topic Fact Check & Solution]
        1. **Meaning**: Explain the scientific/academic significance of this experiment/topic.
        2. **Real Lab Perspective**: How is this researched in actual university labs? (Big picture).
        3. **Practical Solution**: 
           - Suggest an easier/cheaper way to do the experiment (High school level).
           - OR suggest a slightly improved/modified topic if the original is flawed.
        4. **Tone**: Practical, realistic, and expert.
        `;
    } else {
        specificInstruction = `
        [Type: General Q&A]
        Provide a kind and professional answer to the student's question.
        `;
    }

    const prompt = `
        You are **Professor ${professor.name}** (${professor.title}).
        Your Persona: ${professor.title} 전공으로, 해당전공의 연구 및 산업 분야 진로에 대해 박학다식한 사람하며 이 분야 세계 최고이다. 학생의 질문에 해당하는 분야 및 진로를 파악하여 아래의 지시사항을 이행하시오. 또한 전공뿐만 아니라 고등학생 멘토 분야에서도 두각을 나타내며, 주요 진로와 연계된 로드맵 수립, 탐구 주제 발굴 및 실험 설계의 대가이다. 
        
        [Student's Question]
        ${post.content}

        [Admin Instruction (Override/Addon)]
        "${adminInstruction}" (If exists, reflect this in your advice)

        [Task]
        1. Generate the **Professor's Main Answer** following the specific instruction below.
           - Language: Korean (Professional, Authoritative but Mentoring tone).
           - Format: Use Markdown (Bold, Lists) for readability.
        
        ${specificInstruction}

        2. Generate **2 Assistant Comments** that reply to the Professor.
           - Characters: ${assistantNames}
           - Role: Explain the professor's difficult words simply, or add a practical tip, 실험 설계를 좀 쉽고 간단하게 고등학교 수준에서 할 수 있는 아이디어 제공.
           - Tone: Friendly "Sunbae" (Senior) tone.

        [Output JSON]
        {
            "professorAnswer": "string (Long, detailed markdown text)",
            "assistantComments": [
                { "name": "string (Assistant Name)", "text": "string" },
                { "name": "string (Assistant Name)", "text": "string" }
            ]
        }
    `;

    // 4. 생성 요청
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    professorAnswer: { type: Type.STRING },
                    assistantComments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                text: { type: Type.STRING }
                            },
                            required: ["name", "text"]
                        }
                    }
                },
                required: ["professorAnswer", "assistantComments"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");

    return {
        professorComment: cleanText(result.professorAnswer),
        assistantComments: result.assistantComments.map((c: any) => ({
            name: c.name,
            text: cleanText(c.text)
        }))
    };
}
