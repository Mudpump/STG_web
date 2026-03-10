
import { Type } from "@google/genai";
import { CategoryId, Post, Comment, Agent, GradeType } from '../types';
import { CATEGORIES } from '../constants';
import { GRADE_SUBJECT_MAPPING, MAJOR_MAPPING } from '../utils/aiMappings';
import { CURRICULUM_DATA } from '../utils/curriculumData';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

// --- Agent A: Topic Scout ---
export async function runAgentA(
  posts: Post[],
  targetGrade: GradeType,
  targetMonth: number,
  keyword: string,
  log: (msg: string) => void,
  forcedCategory?: CategoryId // Added optional parameter
) {

  let targetCategoryId: CategoryId;
  let targetCategoryName: string;

  if (forcedCategory) {
    targetCategoryId = forcedCategory;
    const targetCategoryInfo = CATEGORIES.find(c => c.id === targetCategoryId);
    targetCategoryName = targetCategoryInfo?.name || targetCategoryId;
    log(`🤖 Agent A (Topic Scout): [강제 지정 모드] ${targetCategoryName} / ${targetGrade} / ${targetMonth}월 분석 중...`);
  } else {
    log(`🤖 Agent A (Topic Scout): ${targetGrade === 'ALL' ? '전체 학년' : targetGrade} 대상 / ${targetMonth}월 / 키워드: [${keyword || '랜덤'}] 분석 중...`);

    // 1. Analyze Category Distribution (Existing Logic)
    const counts: Record<string, number> = {};

    // FIX: Exclude special categories like 'ALL', 'MY_PROFS', 'BREAK' from random generation
    CATEGORIES.forEach(c => {
      if (c.id !== 'ALL' && c.id !== 'MY_PROFS' && c.id !== 'BREAK') {
        counts[c.id] = 0;
      }
    });

    posts.forEach(p => {
      // Only count legitimate categories
      if (counts[p.categoryId] !== undefined) counts[p.categoryId]++;
    });

    // Sort to find least populated category (or random strategy)
    const sortedCategories = Object.entries(counts).sort(([, a], [, b]) => a - b);

    // Fallback if something goes wrong
    if (sortedCategories.length > 0) {
      targetCategoryId = sortedCategories[0][0] as CategoryId;
    } else {
      targetCategoryId = 'BIO_MED'; // Default fallback
    }

    const targetCategoryInfo = CATEGORIES.find(c => c.id === targetCategoryId);
    targetCategoryName = targetCategoryInfo?.name || targetCategoryId;
  }

  // 2. Select Subject based on Semi-Annual Logic (Semester S1/S2)
  const gradeKey = (targetGrade === 'ALL' || targetGrade === 'MIDDLE') ? 'H1' : targetGrade;

  // Semester Rules: 
  // S1 (1st Semester): 2, 3, 4, 5, 6, 7 (February for pre-study)
  // S2 (2nd Semester): 8, 9, 10, 11, 12, 1 (August for pre-study)
  const semester = ([2, 3, 4, 5, 6, 7].includes(targetMonth)) ? 'S1' : 'S2';

  const categorySubjects = GRADE_SUBJECT_MAPPING[targetCategoryId] || GRADE_SUBJECT_MAPPING['ALL'];
  const subjectsList = categorySubjects[gradeKey]?.[semester] || categorySubjects['H1']?.[semester] || ['진로와 직업'];
  const selectedSubject = subjectsList[Math.floor(Math.random() * subjectsList.length)];

  const majors = MAJOR_MAPPING[targetCategoryId] || ['자율전공'];
  const selectedMajor = majors[Math.floor(Math.random() * majors.length)];

  const EXPLORATION_FRAMEWORKS: Record<string, string> = {
    T1: `**T1 [심화 확장형 (Deep Dive Extension)]**\n- **Trigger:** 교과서에 나오는 특정 개념이나 원리에 대한 깊은 의문.\n- **Flow:** 교과서 개념 학습 -> 관련 논문/전공 서적 탐독 -> 고교 수준에서 가능한 심화 이론 적용 또는 실험 설계.\n- **Goal:** 교과 내용을 넘어선 학문적 탐구 역량(Academic Depth) 증명. 하지만 고등학생이 이해하고 감당할 수 있는 수준이어야함`,
    T2: `**T2 [이슈 연결형 (Social Issue Connection)]**\n- **Trigger:** 최근 뉴스, 사회적 이슈, 트렌드 (예: AI, 기후 위기, 저출산, 고령화 등).\n- **Flow:** 사회 현상 포착 -> 배운 교과목의 관점(통계, 윤리, 과학 원리 등)으로 원인 분석 -> 고교생 수준의 대안 제시.\n- **Goal:** 세상을 바라보는 비판적 사고력(Critical Thinking)과 지식의 현실 적용 능력 증명.`,
    T3: `**T3 [속설 검증형 (Mythbusters)]**\n- **Trigger:** 교과서 개념을 배우다가 문득 떠오른 일상 속 '속설'이나 '흔한 믿음' (예: 산성비 맞으면 대머리 된다?).\n- **Flow:** 교과서 개념(기준점) -> 속설에 대한 가설 설정 -> 고등학생이 할 수 있는 수준의 데이터 분석, 문헌 조사 또는 간단한 실험으로 과학적/학문적 검증 -> 결론 도출.\n- **Goal:** 교과 개념을 실생활에 적용하여 사실을 규명하는 과학적/논리적 검증 능력 증명.`,
    T4: `**T4 [일상 불편 해결형 (Daily Problem Solving)]**\n- **Trigger:** 학교 생활이나 일상에서 본인 또는 타인이 겪는 '불편함'이나 '비효율'.\n- **Flow:** 문제 정의 -> 교과 및 전공 지식(공학, 디자인, 코딩, 정책 제안 등)을 활용하여 고교 수준에서 구현 가능한 해결책(프로토타입, 캠페인, 제도 개선안) 기획 및 제작.\n- **Goal:** 지식을 활용해 실질적인 가치를 만들어내는 문제 해결 능력(Problem Solving) 증명.`
  };
  const logicKeys = Object.keys(EXPLORATION_FRAMEWORKS);
  const selectedLogicKey = logicKeys[Math.floor(Math.random() * logicKeys.length)];
  const selectedLogicDetail = EXPLORATION_FRAMEWORKS[selectedLogicKey];

  const GRADE_CONSTRAINTS: Record<string, string> = {
    H1: `[1학년 수준 (Grade 1 Depth)]\n- 목표: 전공에 대한 폭넓은 관심과 '호기심' 증명.\n- 방법: 교과서 개념을 일상이나 진로와 연결하는 수준의 기초 문헌 조사 및 보고서 작성.\n- 주의: 너무 전문적인 실험이나 대학 수준의 이론은 피할 것.`,
    H2: `[2학년 수준 (Grade 2 Depth)]\n- 목표: 전공 관련 '분석력'과 '탐구 역량' 증명.\n- 방법: 가설 설정, 데이터 수집/분석, 간단한 실험 설계 등 구체적인 방법론 적용.\n- 주의: 1학년보다 심화된 교과 개념을 활용하되, 고교 수준에서 가능한 현실적인 실험/분석일 것.`,
    H3: `[3학년 수준 (Grade 3 Depth)]\n- 목표: 전공에 대한 '융합적 사고'와 '문제 해결력' 증명.\n- 방법: 1,2학년의 지식을 바탕으로 사회적 가치 창출, 정책 제안, 프로토타입 기획 등 실질적 대안 제시.\n- 주의: 고등학교 교육과정의 최종 단계로서, 교과 지식이 실제 문제 해결로 이어지는 과정을 보여줄 것.`
  };
  const gradeConstraint = GRADE_CONSTRAINTS[gradeKey] || GRADE_CONSTRAINTS['H1'];

  // 3. Curriculum Matching Logic
  let curriculumContext = "";
  const monthlyData = CURRICULUM_DATA[gradeKey]?.[targetMonth];

  if (monthlyData) {
    const matchingKey = Object.keys(monthlyData).find(key => selectedSubject.includes(key) || key.includes(selectedSubject.split('(')[0]));
    if (matchingKey) {
      curriculumContext = `
            [Current Curriculum Status]
            - Current Month: ${targetMonth}
            - Subject Unit: ${monthlyData[matchingKey].join(', ')}
            - Instruction: The student is currently learning these units. Select the ONE most relevant unit/topic from the list and connect the research topic DIRECTLY to its concepts. Avoid over-complicating by trying to use all units at once.
          `;
    } else {
      const backgroundSubjects = Object.entries(monthlyData).map(([sub, topics]) => `${sub}: ${topics[0]}`).join(' / ');
      curriculumContext = `
            [Time Context]
            - Current Month: ${targetMonth}
            - This subject (${selectedSubject}) might be an elective or specialized course.
            - Background subjects: [${backgroundSubjects}].
          `;
    }
  } else {
    curriculumContext = `[Vacation / General Mode] Month: ${targetMonth}. Focus on self-directed research.`;
  }

  log(`🎯 타겟: [${targetCategoryName}] - [${gradeKey} / ${targetMonth}월(${semester})] - [${selectedSubject}] - [전략: ${selectedLogicKey}]`);

  const prompt = `
    You are Agent A, a high school admissions consulting AI.
    Create a detailed "Student Record (Se-Teuk)" research topic plan.
    
    [Context] 
    - Grade: ${gradeKey} (Korean High School)
    - Category: ${targetCategoryName}
    - Subject: ${selectedSubject}
    - Major: ${selectedMajor}
    - Strategy Framework: 
      ${selectedLogicDetail}
    - Grade Depth Constraint:
      ${gradeConstraint}
    - **Current Era**: Assume the current year is **2026**.
    - **User Keyword Constraint**: "${keyword || 'None'}"
    ${curriculumContext}
    
    [Instruction]
    - Create a topic appropriate for a ${gradeKey} student.
    - Use specific curriculum info if available.
    - **CRITICAL**: If "User Keyword Constraint" is provided (and not 'None'), you MUST connect the Subject (${selectedSubject}) with this keyword.
      (e.g., If keyword is "Convenience Store" and subject is "Math", create a topic like "Optimization of store inventory using Calculus".)
    - If no keyword is provided, feel free to be creative based on the strategy.
    - **Title Constraint**: Do NOT include the year "2026" in the topicTitle.

    [Output JSON] 
    { 
      "topicTitle": "string", 
      "topicDescription": "string (Short summary of the topic)", 
      "tags": ["string"] 
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
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["topicTitle", "topicDescription", "tags"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return { ...result, targetCategory: targetCategoryId, logicType: selectedLogicKey, logicTypeDetail: selectedLogicDetail, gradeKey };
}

// --- Agent B: Scenario Writer ---
export async function runAgentB(topicData: any, author: Agent, commenters: Agent[], log: (msg: string) => void, feedback?: string) {
  if (feedback) {
    log(`📝 Agent B: 멘토 피드백 반영하여 재작성 중... [피드백: ${feedback.substring(0, 30)}...]`);
  } else {
    log(`📝 Agent B (Scenario Writer): ${author.nickname} 외 ${commenters.length}명 대본 집필...`);
  }

  const castList = `
    [Author] ${author.nickname} (${author.major_category})
    [Commenters] ${commenters.map(c => `${c.nickname} (${c.role_type})`).join(', ')}
  `;

  const basePrompt = `
    You are Agent B, a screenwriter for a lively high school community.
    
    [Exploration Framework Used]
    ${topicData.logicTypeDetail || "T1~T4 Framework"}

    [Topic Info] 
    - Title: ${topicData.topicTitle}
    - Desc: ${topicData.topicDescription}
    - Grade: ${topicData.gradeKey}
    
    [Cast]
    ${castList}
  `;

  const taskInstruction = `
    [Task] 
    1. Write a Post as the [Author]. Express anxiety or curiosity. Tone: High school student.
       - **Title Constraint**: Do NOT include "2026" in the title.
    2. Write 4~6 Comments using the [Commenters]. 
       - Tiki-Taka interaction.
       - Since they are students, explain **easy ways to plan experiments and analysis** in the initial stage and provide **realistic methods** to concretize the experiment.
       - Use Korean Internet Slang.
       - **IMPORTANT**: Use **Specific Subject & Academic Terminology**. 
         - Instead of vague words like "science experiment", use specific terms from the high school textbook (e.g., "Titration", "Conservation of Momentum", "Social Contract Theory").
         - If relevant to a major, use introductory undergraduate terms (e.g., "Regression Analysis", "Bioinformatics", "Marketing Mix").
         - The goal is to show **academic depth** appropriate for a high school student record (Se-Teuk).

    [Output JSON] 
    { 
      "post": { "title": "string", "content": "string" }, 
      "comments": [{ "agentName": "string", "text": "string" }] 
    }
  `;

  const feedbackInstruction = feedback ? `
    **[CRITICAL MENTOR FEEDBACK - REWRITE REQUIRED]**
    Your previous draft was rejected by the Head Mentor.
    Reason: "${feedback}"
    
    **YOU MUST FIX THE ISSUES ABOVE.** 
    - If the feedback says "Forced Connection", make the link between subject and major more natural or choose a different angle.
    - If the feedback says "Not Feasible", suggest an easier/safer experiment or research method (e.g. simulation, survey, literature review).
  ` : "";

  const prompt = basePrompt + feedbackInstruction + taskInstruction;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          post: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
            required: ["title", "content"]
          },
          comments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { agentName: { type: Type.STRING }, text: { type: Type.STRING } },
              required: ["agentName", "text"]
            }
          }
        },
        required: ["post", "comments"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");

  if (result.post) {
    result.post.content = cleanText(result.post.content);
    result.post.title = cleanText(result.post.title);
    result.post.tags = topicData.tags;
  }
  if (result.comments) {
    result.comments.forEach((c: any) => c.text = cleanText(c.text));
  }

  return result;
}

// --- Agent M: Mentor ---
export async function runAgentM(scenarioData: any, log: (msg: string) => void): Promise<{ decision: 'PASS' | 'REJECT', feedback: string }> {
  log("🧐 Agent M (Mentor): 교과 연계성, 전공 적합성, 실현 가능성 검수 중...");

  const prompt = `
        You are 'Agent M', the Chief Editor and Admissions Mentor for a high school community.
        
        [Content to Review]
        Post Title: ${scenarioData.post.title}
        Post Content: ${scenarioData.post.content}
        Comments: ${JSON.stringify(scenarioData.comments.map((c: any) => c.text))}

        [Evaluation Criteria]
        1. **Curriculum Connection:** Is the topic naturally connected to the subject learning objectives? (e.g., does a Math topic actually use Math concepts?)
        2. **Natural Major Fit:** Is the connection to the major logical and not forced? 
           - **BAD Example:** Linking 'English Literature' to 'Mechanical Engineering' without any logical bridge.
           - **GOOD Example:** Linking 'Physics (Thermodynamics)' to 'Mechanical Engineering'.
        3. **Feasibility:** Is the research method or experiment realistic for a high school student to perform in a school setting? (Avoid dangerous chemicals, expensive equipment, or PhD-level theory).
        4. **Concrete Guidance:** Do the comments provide specific, actionable advice (e.g., specific theories, tools, papers, methods) that helps **concretize** the student's abstract idea? The "Tiki-Taka" should lead to a clear research plan.

        [Task]
        - If everything looks good, decision: "PASS".
        - If there are issues (Forced logic, Dangerous/Impossible experiment, Vague advice), decision: "REJECT" and provide specific instructions to fix it.

        [Output JSON]
        {
            "decision": "PASS" | "REJECT",
            "feedback": "string (If REJECT, explain what to fix clearly. If PASS, leave empty)"
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
          decision: { type: Type.STRING, enum: ["PASS", "REJECT"] },
          feedback: { type: Type.STRING }
        },
        required: ["decision", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || '{ "decision": "PASS", "feedback": "" }');
}

// --- Agent C: Scheduler ---
export function runAgentC(scenarioData: any, categoryId: CategoryId, author: Agent, targetGrade: GradeType, log: (msg: string) => void): Post {
  const NOW = Date.now().toString();
  const postOffsetMins = Math.floor(Math.random() * 50) + 10;

  const formattedComments: Comment[] = (scenarioData.comments || []).map((c: any, idx: number) => {
    let role = 'Peer';
    if (c.agentName.includes('거품') || c.agentName.includes('팩트')) role = 'Fact';
    if (c.agentName.includes('선배') || c.agentName.includes('네비')) role = 'Strategy';

    let agoMins = postOffsetMins - ((idx + 1) * 3);
    if (agoMins < 1) agoMins = 1;

    return {
      id: (Date.now() + idx + 100).toString(),
      agentName: c.agentName,
      role: role,
      text: c.text,
      likes: Math.floor(Math.random() * 30),
      createdAt: `${agoMins}분 전`,
      isUser: false
    };
  });

  return {
    id: NOW,
    categoryId: categoryId,
    authorAgent: author.nickname,
    authorRole: author.role_type,
    title: scenarioData.post.title,
    content: scenarioData.post.content,
    previewText: scenarioData.post.content.substring(0, 60) + '...',
    comments: formattedComments,
    viewCount: Math.floor(Math.random() * 6) + 15, // 15 to 20
    likeCount: Math.floor(Math.random() * 20),
    createdAt: `${postOffsetMins}분 전`,
    tags: scenarioData.post.tags || ['세특'],
    isUser: false,
    targetGrade: targetGrade
  };
}
