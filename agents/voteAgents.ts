
import { Type } from "@google/genai";
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

// 다양성을 위한 토론 주제 시드 리스트
const VOTE_SEEDS = [
    // A. 학교생활 & 교육
    "평가/입시 (예: 수능 자격고사화, 절대평가 전환, 수행평가 폐지)",
    "교칙/생활 (예: 교복 자율화, 두발 완전 자유, 교내 CCTV 설치, 연애 금지)",
    "디지털 교육 (예: 교과서 전면 태블릿화, 챗GPT 과제 허용 범위)",
    "권리/의무 (예: 학생회 권한 강화, 청소 용역화, 야자 강제성)",
    
    // B. 기술 & 미래 윤리
    "AI 공존 (예: AI 판사 도입, 로봇과의 결혼, 예술 창작 AI 저작권)",
    "생명 공학 (예: 맞춤형 아기 허용, 냉동인간, 동물실험 전면 금지)",
    "가상 현실 (예: 뇌세척(기억 삭제) 기술, 완벽한 가상세계 vs 고통스런 현실)",
    "우주/환경 (예: 화성 이주권 추첨, 기후 난민 수용)",
    
    // C. 사회 이슈 & 법
    "정의/처벌 (예: 사형제 부활, 소년법 폐지, 음주 감형 삭제)",
    "복지/경제 (예: 기본소득 지급, 부자 증세, 노인 지하철 무임승차 폐지)",
    "젠더/가족 (예: 군 복무 가산점, 비혼 출산 허용, 징병제 vs 모병제)",
    "문화 규제 (예: 게임 셧다운제 부활, 노키즈존 법적 금지/허용)",
    
    // D. 밸런스 게임
    "능력 vs 노력 (예: 재능 100% vs 노력 100%, 과정 vs 결과)",
    "인간관계 (예: 알 권리 vs 잊혀질 권리, 착한 거짓말 허용 여부)",
    "성공의 기준 (예: 워라밸(돈 적게) vs 벼락부자(수명 단축))",
    "극한 상황 (예: 트롤리 딜레마 변형, 다수를 위한 소수의 희생)"
];

// --- Vote Agents ---
export const runVoteAgents = async (log: (msg: string) => void): Promise<any> => {
    // 랜덤 시드 선택
    const targetTopic = VOTE_SEEDS[Math.floor(Math.random() * VOTE_SEEDS.length)];
    
    log(`⚖️ Vote Agents: 토론 주제 생성 중... (Target: ${targetTopic})`);
    
    const { commenters } = await fetchCastFromDB(null, 10);
    const castListStr = commenters.map(c => `- ${c.nickname} (Role: ${c.role_type})`).join('\n');

    const prompt = `
        Debate Moderator.
        Current Year: 2026.
        Create a controversial debate topic focusing specifically on: **${targetTopic}**.
        
        [Cast] ${castListStr}
        [Task] 1. Create Topic (Title, Desc, A vs B). 2. Generate 8-12 Comments.
        
        - **Title Guidelines**: 
          - Make it **Descriptive and Provocative**. It should clearly state the conflicting values.
          - Recommended Format: "Topic: Argument A vs Argument B?" or a specific question describing the situation.
          - **Good Examples**: 
            - "교실 내 AI 교사 전면 도입: 맞춤형 교육의 혁명인가, 교육의 비인간화인가?"
            - "유전자 가위 기술을 이용한 '맞춤형 아기' 허용해야 할까?"
            - "국가 표준 학력 평가 시 'AI 뉴럴 링크' 보조 도구 사용 허용 논란"
          - Do NOT include "2026" in the title.
        
        - **Option Format (A/B)**: 
          - Make them **concise but descriptive enough** to understand the reasoning.
          - Format: "Stance (Key Reason)"
          - **Good Examples**: "찬성 (맞춤형 교육 실현)", "반대 (정서적 교감 부재)", "허용 (난치병 치료 목적)", "금지 (생명 윤리 위반)"
          - Length: Aim for 15-25 characters per option.
        
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
     
    return { ...result, votesA: 0, votesB: 0, likeCount: Math.floor(Math.random() * 30) + 5, comments: generatedComments };
};
