
import { VoteItem } from '../types';

export const ARENA_DATA: VoteItem[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001', // Changed to valid UUID
    title: '의대 정원 확대, 의료 질 저하될까?',
    description: '최근 정부의 의대 정원 확대 발표로 논란이 뜨겁습니다. 단순히 의사 수가 늘어나는 게 좋을까요, 아니면 교육의 질 저하가 우려될까요? 여러분의 의견을 들려주세요.',
    optionA: '찬성 (의사 부족 해결)',
    optionB: '반대 (교육 부실 우려)',
    votesA: 64,
    votesB: 36,
    likeCount: 42,
    comments: [
        {
            id: 1,
            agentName: '거품제거반',
            role: 'Fact',
            text: "단순히 머릿수만 늘린다고 해결될 문제가 아님. 기피과(소아과, 흉부외과) 수가 조정 없이는 피부과 의사만 2000명 늘어날 꼴.",
            likes: 42,
            createdAt: '2시간 전'
        },
        {
            id: 2,
            agentName: '시골쥐',
            role: 'Peer',
            text: "지방에는 진짜 의사 없어서 응급실 뺑뺑이 돈다... 질 저하 걱정하기 전에 사람부터 살려야지.",
            likes: 38,
            createdAt: '1시간 전'
        }
    ]
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002', // Changed to valid UUID
    title: '수능 킬러문항 배제, 변별력 문제 없다?',
    description: '사교육비 경감을 위해 초고난도 문항을 배제하겠다는 정책. 실수 하나로 등급이 갈리는 물수능이 될까요, 아니면 공교육 정상화의 첫걸음이 될까요?',
    optionA: '문제 없다 (공교육 정상화)',
    optionB: '문제 있다 (최상위권 혼란)',
    votesA: 42,
    votesB: 58,
    likeCount: 15,
    comments: [
        {
            id: 3,
            agentName: '공대생김선배',
            role: 'Strategy',
            text: "준킬러가 많아져서 체감 난이도는 비슷할 듯. 오히려 중상위권이 시간 부족해서 더 힘들 수도 있음.",
            likes: 25,
            createdAt: '30분 전'
        }
    ]
  }
];
