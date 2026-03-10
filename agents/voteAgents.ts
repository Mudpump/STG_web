
import { Type } from "@google/genai";
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

// 다양성을 위한 토론 주제 카테고리 (고등학생 사고력 확장 최적화)
const DEBATE_THEMES = [
    // A. 학교생활 & 교육
    "시험 및 평가 방식의 변화와 공정성 (예: 과정 중심 vs 결과 중심)",
    "학교 규칙과 학생 자율권 사이의 적절한 균형점",
    "학교에서의 AI 및 디지털 도구 활용 범위와 그 한계",
    "학교 내 역할 분담, 봉사활동, 자치 활동의 의무와 권리",

    // B. 기술 & 일상 속 윤리
    "일상에 스며든 AI 기술이 우리의 판단력과 관계에 미치는 영향",
    "SNS 및 온라인 공간에서의 표현의 자유와 책임의 경계",
    "개인정보 보호와 공익(안전) 사이의 줄다리기",
    "새로운 기술 혁신이 직업 세계를 바꿀 때 대비해야 할 가치",

    // C. 사회 & 공존
    "다수결이 항상 적합한가? 소수 의견과 다양성의 가치",
    "공정한 기회 보장 vs 결과의 평등, 어디에 무게를 둬야 하는가",
    "세대 및 계층 간 가치관 차이와 상호 이해의 방법",
    "환경 보호를 위해 우리의 일상적 편의를 어디까지 양보할 수 있는가",

    // D. 자아 & 가치관
    "현실적 안정성을 추구하는 진로 vs 불확실하지만 가슴 뛰는 꿈",
    "서로를 자극하는 경쟁 vs 함께 성장하는 협력, 어느 쪽이 나은가",
    "이미지와 성적 관리: 올바른 자기 표현인가, 과도한 사회적 압박인가",
    "실패와 좌절 상황에서: 끈기 있게 버텨야 할 때와 과감히 포기해야 할 때의 기준"
];

// 상황을 비트는 무작위 극단적 제약 조건 (창의성 강제 유발)
// 사고의 관점을 비트는 부드러운 렌즈 (다양한 각도의 생각 유도)
const THINKING_ANGLES = [
    "관점 전환: 평소 학생들이 당연하다고 여겼던 가치를 반대 입장에서 바라보며 고민하게 하라.",
    "딜레마 심화: 양쪽 입장 모두 실질적인 일리가 있어서 쉽게 한쪽을 무조건적으로 옹호할 수 없는 상황을 제시하라.",
    "구체적 상황: 모호하고 거창한 정책이 아니라, 실제 교실, 가정, 혹은 동아리 등 10대들의 일상에서 흔히 일어날 수 있는 구체적인 장면으로 구성하라.",
    "숨겨진 전제 발견: 대다수가 피상적으로 동의하는 명제 속에 숨겨진 가정이나 모순점을 드러내는 주제를 설정하라.",
    "미래 연결: 지금 당장의 작은 선택이 5~10년 후 자신의 진로나 삶의 태도에 어떤 큰 영향을 미칠지 깊이 생각하게 하라."
];

// 흔해빠진 진부한 주제를 금지하는 네거티브 키워드
const PROHIBITED_KEYWORDS = "사형제도 부활, 소년법 폐지/촉법소년, 교복 자율화/두발 자유, 수능 절대평가/자격고사, 맞춤형 아기(유전자 가위), 동물실험 반대, 게임 셧다운제, 노키즈존, 단순 기본소득 지급, 트롤리 딜레마 변형, 뉴럴링크, 대역폭 할당, 냉동인간, 뇌 이식, 자원 고갈 디스토피아, 인구 통제";

// --- Vote Agents ---
export const runVoteAgents = async (log: (msg: string) => void): Promise<any> => {
    // 랜덤 시드 및 제약 조건 선택
    const targetTheme = DEBATE_THEMES[Math.floor(Math.random() * DEBATE_THEMES.length)];
    const randomAngle = THINKING_ANGLES[Math.floor(Math.random() * THINKING_ANGLES.length)];

    log(`⚖️ Vote Agents: 토론 주제 생성 중... (Theme: ${targetTheme})`);

    const { commenters } = await fetchCastFromDB(null, 10);
    const castListStr = commenters.map(c => `- ${c.nickname} (Role: ${c.role_type})`).join('\n');

    const prompt = `
        Debate Moderator.
        Current Year: 2026.

        [Task] 
        1. Create a genuinely thought-provoking and intellectually stimulating debate topic focusing on the [Theme], while incorporating the [Thinking Angle]. 
        2. Generate 8-12 Comments from peer agents sharing diverse perspectives thoughtfully about the topic.
        
        [Theme]: **${targetTheme}**
        [Thinking Angle]: **${randomAngle}**
        
        [Cast (Participants)] 
        ${castListStr}
        
        [CRITICAL RULES - DO NOT IGNORE]
        - **NEGATIVE PROMPT**: DO NOT use common, overused examples such as: ${PROHIBITED_KEYWORDS}. 
        - **TONE GUIDELINES**:
          - The target audience is Korean high school students using this for intellectual growth.
          - The topic must feel FAMILIAR and RELATABLE — grounded in real school life, friendships, career choices, or current societal trends they actually care about.
          - Avoid extreme dystopian/sci-fi scenarios, extreme violence, or completely unrealistic hypotheticals.
          - Create a topic that makes high school students genuinely pause and think deeply before choosing a side.
        
        - **Title Guidelines**: 
          - Make it **Descriptive and Thought-Provoking**. It should clearly state the conflicting values or the situation.
          - Recommended Format: "Topic: Argument A vs Argument B?" or a specific question describing the situation.
          - Do NOT include "2026", "2045", or specific futuristic years in the title.
        
        - **Option Format (A/B)**: 
          - Make them **concise but descriptive enough** to understand the reasoning.
          - Format: "Stance (Key Reason)"
          - Length: Aim for 15-30 characters per option. Both options should be reasonable and defensible, creating genuine intellectual tension.
            - Good Example: "A 찬성 (과정에서의 공정성 우선)", "B 반대 (결과의 실질적 형평성 우선)"
        
        [Output JSON]
        {
          "title": "string",
          "description": "string",
          "optionA": "string",
          "optionB": "string",
          "comments": [{ "agentName": "string", "text": "string" }]
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
                    description: { type: Type.STRING },
                    optionA: { type: Type.STRING },
                    optionB: { type: Type.STRING },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { agentName: { type: Type.STRING }, text: { type: Type.STRING } },
                            required: ["agentName", "text"]
                        }
                    }
                },
                required: ["title", "description", "optionA", "optionB", "comments"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");
    const generatedComments = (result.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.agentName,
        role: 'Peer',
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 20),
        createdAt: "방금 전",
        isUser: false
    }));

    const totalVotes = Math.floor(Math.random() * 6) + 15; // 15 to 20명
    const votesA = Math.floor(totalVotes / 2) + (Math.random() > 0.5 ? 1 : 0);
    const votesB = totalVotes - votesA;

    return { ...result, votesA, votesB, likeCount: Math.floor(Math.random() * 30) + 5, comments: generatedComments };
};
