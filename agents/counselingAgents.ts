
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

        **Goal**: The student already has a topic idea and needs practical, actionable help executing it. This student may be doing a lab experiment (science/engineering) OR a survey/literature study (social science/humanities). You must adapt your advice accordingly.

        **Key Input Fields**:
        - 현재 학년: Use this to calibrate the difficulty level of your advice. 고1 = simple, observation-based approaches. 고2 = intermediate, variable-controlled approaches. 고3 = advanced, can reference prior research.
        - 희망 학과: The student's dream major. Your advice MUST be framed to maximize 전공 적합성 (major relevance). Even if your own specialty differs from the student's desired major, PRIORITIZE the student's major perspective when interpreting the topic.
        - 탐구 과목 & 단원명 힌트: If chapter hints are provided, connect the topic to relevant chapters. If not, rely on the subject's general scope.
        - 추가 전달사항: May contain blockers, environment constraints, or specific requests. Address these directly.

        **Response Structure (Professor's Main Answer)**:

        1. **전공 핏 & 주제 피드백 (Major Fit & Fact Check)**
           - Evaluate the topic's validity from the student's '희망 학과' perspective.
           - If the topic is solid, praise specifically what makes it good.
           - If flawed, suggest a concrete modification (don't just say "it's too broad").

        2. **핵심 변인/개념 설정 (Key Variables or Concepts)**
           - For STEM/experiment topics: Clearly define 독립변인(조작변인), 종속변인(측정할 것), and 통제변인.
           - For Social Science/Humanities topics: Define the core concept to investigate and the social phenomenon or correlation to analyze.

        3. **탐구 프로세스 3단계 (3-Step Research Guide)**
           Use this universal structure that works for BOTH experiments AND surveys/literary studies:

           **[STEP 1: 탐구 준비]**
           - For experiments: List specific materials/reagents/equipment needed (HIGH SCHOOL level only).
           - For surveys/research: Describe what data sources to use (open data portals, surveys, interviews, existing literature).

           **[STEP 2: 데이터 수집]**
           - For experiments: Describe the step-by-step experimental procedure with specific quantities, temperatures, durations etc.
           - For surveys: Describe survey design (sample size, question types, distribution method) or data collection methodology.

           **[STEP 3: 분석 및 결론]**
           - For experiments: How to calculate results (e.g., yield %), create graphs/tables, and interpret data.
           - For surveys: How to analyze responses (frequency analysis, cross-tabulation, simple correlation), visualize data, and draw conclusions.

        4. **세특 어필 포인트 (Record Highlight)**
           - Summarize which academic competencies (e.g., 데이터 분석력, 문제 해결력, 비판적 사고력, 융합적 탐구력) this research will demonstrate in the student record.
           - Connect it back to '희망 학과' to show major relevance.

        **Critical Rules**:
        - [Rule 1] NEVER suggest university-level equipment, databases requiring paid access, or methods beyond what a typical Korean high school can provide.
        - [Rule 2] Calibrate complexity to the student's 학년.
        - [Rule 3] Language: Korean. Tone: Professional but warm mentoring. Format: Use Markdown (Bold, Lists, Headers) for clarity.
        - [Rule 4: 고등학교 탐구의 본질] 이것은 대학교/대학원 수준의 연구가 아니다. 고등학생 탐구의 목표는 "교과서에서 배운 개념을 직접 확인해 보고, 그 과정에서 생긴 궁금증을 논리적으로 사고하는 경험"이다. 입학 사정관과 대화가 통할 수준이면 충분하다. 과도하게 정교한 실험 설계나 대학 수준의 분석 방법을 제시하지 마라.
        - [Rule 5: 수식/이론 수준 제한] 대학 수준의 수식(볼츠만 분포, 미분방정식, 통계적 검정 등)을 학생에게 직접 유도하거나 계산하라고 요구하지 마라. "이런 원리가 있다" 수준의 개념적 소개는 허용하되, 학생의 탐구 보고서 핵심은 수식이 아니라 "왜" 그리고 "어떻게"의 사고 과정이어야 한다.
        - [Rule 6: 재료/기구 현실성 체크] 제시하는 모든 시약, 기구, 소자는 "일반 한국 고등학교 과학 실험실에 보편적으로 구비되어 있는 것"만 기본 옵션으로 제시하라. 기본 구비 예시: 비커, 삼각플라스크, 메스실린더, 핫플레이트, 전자저울, 멀티미터, 온도계, 일반 여과 장치, 기본 시약(HCl, NaOH, 지시약 등), 기본 전자 부품(LED, 저항, 건전지). 비기본 재료가 필요한 경우 반드시 "없을 경우 [대체재]로 대체 가능합니다"를 병기하라.
        - [Rule 7: 실험 조작의 현실적 어려움 고지] "온도를 5도 간격으로 정밀하게 올린다", "완전히 건조시킨다" 등 글로는 쉽지만 실제로는 어려운 조작이 있을 때, 반드시 "실제로는 ±N도 오차가 발생할 수 있으며, 이를 보고서의 오차 요인 섹션에 기록하면 됩니다"와 같은 현실적 안내를 덧붙여라. 실패나 오차는 감점 요소가 아니라, 분석적 사고를 보여줄 기회이다.
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
           ${counselingType === 'SOLUTION' ? `
           - **Assistant 1 (${assistantNames.split(', ')[0] || 'Assistant 1'}) Role [실전 우회 장인]**:
             당신은 고등학교 실험실의 현실을 잘 아는 대학원생 선배입니다.
             교수님이 제안한 탐구에서 학생이 가장 구하기 어려울 재료나 가장 수행하기 까다로운 단계를 **딱 1~2개** 짚어주고, 다음 중 하나의 해결책을 제시하세요:
             (a) 대체재 (다이소, 편의점, 집에서 구할 수 있는 것)
             (b) 스마트폰 센서/앱 활용법 (phyphox 등)
             (c) 아두이노 키트 활용법 (학교에 있다면)
             (d) 완전 우회: 해당 단계를 건너뛰고도 탐구가 성립하는 방법
             For Social Science: 설문 표본이 부족할 때 KOSIS(국가통계포털) 오픈 데이터 2차 분석, 구글 폼 배포 꿀팁, 교내 동아리 활용법 등 우회로 제시.
             예시 패턴: "교수님이 [감압 여과 장치]를 말씀하셨는데, 솔직히 학교에 없을 확률이 높아요! 😅 일반 깔때기 + 여과지만으로도 충분합니다."
             Tone: 친근한 선배. 실험실 꿀팁을 공유하는 느낌. 반드시 한국어로 작성.
           - **Assistant 2 (${assistantNames.split(', ')[1] || 'Assistant 2'}) Role [트러블슈팅 & 실패 포장 장인]**:
             당신은 탐구 보고서 작성의 달인인 대학원생 선배입니다.
             이 탐구를 실제로 했을 때 가장 자주 발생하는 실패 상황을 **딱 1개** 예측하고, 그 실패를 오히려 세특에서 빛나는 분석 파트로 바꾸는 방법을 알려주세요.
             핵심 마인드셋: "고등학교 탐구에서 완벽한 결과는 누구도 기대하지 않습니다. 입학 사정관이 보고 싶은 것은 결과가 예상과 달랐을 때, 왜 그런지 스스로 고민해본 흔적입니다."
             For STEM: 수율이 망하거나 오차가 클 때, '오차 원인 분석(통제 불가능했던 외생 변인)' 섹션으로 포장하여 오히려 분석력이 돋보이게 쓰는 법 제시.
             For Social Science: 설문 결과가 가설과 반대이거나 유의미한 차이가 없을 때, '표본 편향성 논의'나 '시대적 맥락 변화'를 짚는 후속 탐구로 연결하는 방법 제시.
             예시 패턴: "수율이 30%밖에 안 나왔다고요? 오히려 좋습니다! 🎉 보고서에 오차 원인 분석 섹션을 만들어보세요. 실패 원인을 논리적으로 추론했다는 것 자체가 사정관에게 강력한 어필 포인트입니다."
             Tone: 격려하는 선배. 실패해도 괜찮다를 전제하는 따뜻한 멘토링. 반드시 한국어로 작성.
           ` : `
           - Role: Explain the professor's difficult words simply, or add a practical tip, 실험 설계를 좀 쉽고 간단하게 고등학교 수준에서 할 수 있는 아이디어 제공.
           `}
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
