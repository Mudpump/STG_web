
import { Type } from "@google/genai";
import { Post, Comment, Agent } from '../types';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';
import { PROFESSORS } from '../constants';

// 상담 유형 감지 헬퍼
function detectCounselingType(content: string): 'ROADMAP' | 'CONNECTION' | 'SOLUTION' | 'GENERAL' {
    if (content.includes('로드맵 설계형')) return 'ROADMAP';
    if (content.includes('생기부 연계/심화형')) return 'CONNECTION';
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
        **Core Strategy**: The "Limitation" of the previous grade triggers the "Motivation" for the next.
        **Framework Application**: Apply the **${selectedModelName}** logic to each grade's narrative structure.

        ${frameworkLogic}

        [Structure Requirements based on ${selectedModelName}]
        
        **1. Grade 1: The Trigger (Discovery & Thirst)**
        - **Logic**: Apply the **1st letter** of ${selectedModelName}.
        - **Narrative**: Start with curiosity from daily life, news, or textbooks related to the student's interest.
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
        - **Result**: Propose a concrete solution (Model, Policy, Algorithm) that solves the real-world problem.

        [Formatting Rules]
        - **Show, Don't Tell**: NEVER mention internal framework names (DMS, QMI, etc.) or terms like "Limitation", "Linkage" in the output text.
        - **Tone**: Detailed, strategic, and visionary. Explain *WHY* this flow is necessary for their specific major.
        - **Content Item Format**: For each grade, provide 2-3 core subject activities.
           - **과목:** [Subject Name]
           - **탐구주제:** [Topic Title]
           - **활동요약:** [Concise summary]
           - **생기부 연결고리:** [Explain the narrative flow: Why this? What was the limitation? How does it connect to the next?]
        `;
    } else if (counselingType === 'CONNECTION') {
        specificInstruction = `
        [Type: 🔗 Record Connection]
        1. **Narrative Link**: Explain how the previous activity connects to the new goal.
        2. **Detailed Topic**: Provide a specific, deep exploration topic for the 'Next Subject'.
        3. **Tone**: Logical, cohesive, and deepening.
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
        Your Persona: ${professor.introduction}
        
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
           - Role: Explain the professor's difficult words simply, or add a practical tip (e.g., specific website, tool).
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
