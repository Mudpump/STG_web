
export type EpisodeType = 'E1_IBULKICK' | 'E2_GOGUMA' | 'E3_HYEONTA' | 'E4_SOHWAKHAENG';

export interface EpisodeRecipe {
  id: string;
  type: EpisodeType;
  place: string;
  target: string;
  situation: string;
  emotion: string;
  context: string;
}

export const EPISODE_RECIPES: EpisodeRecipe[] = [
  // --- E1: 이불킥 (Embarrassment/Mistake) 15 ---
  { id: 'e1-1', type: 'E1_IBULKICK', place: '교실', target: '담임선생님', situation: '호칭 실수', emotion: '수치사', context: '담임쌤한테 "엄마"라고 불렀는데 쌤이 "어 그래 아들" 하고 받아침. 반 애들 다 웃음.' },
  { id: 'e1-2', type: 'E1_IBULKICK', place: '독서실', target: '전체', situation: '생리현상', emotion: '쥐구멍', context: '적막이 흐르는 독서실에서 배에서 꼬르륵 소리가 천둥처럼 울려 퍼짐.' },
  { id: 'e1-3', type: 'E1_IBULKICK', place: '복도', target: '짝남/짝녀', situation: '착각', emotion: '민망', context: '짝남이 손 흔들길래 설레서 같이 흔들었는데, 내 뒤에 있는 친구한테 한 거였음.' },
  { id: 'e1-4', type: 'E1_IBULKICK', place: '급식실', target: '전교생', situation: '넘어짐', emotion: '아픔보다 쪽팔림', context: '식판 들고 가다가 미끄러져서 국물 뒤집어쓰고 식판 와장창 소리 남.' },
  { id: 'e1-5', type: 'E1_IBULKICK', place: '반 단톡방', target: '반 친구들', situation: '뒷담화 실수', emotion: '삭제 불가', context: '선생님 뒷담화를 실수로 선생님이 포함된 반 단톡방에 전송함. 숫자 1씩 줄어드는 중.' },
  { id: 'e1-6', type: 'E1_IBULKICK', place: '발표 시간', target: '반 전체', situation: '음이탈', emotion: '음소거 희망', context: '진지하게 국어 책 읽거나 발표하다가 목소리 삑사리 나서 반 애들 다 책상에 머리 박고 웃음.' },
  { id: 'e1-7', type: 'E1_IBULKICK', place: '인스타그램', target: '전교생', situation: '부계정 착각', emotion: '디지털 장례식', context: '비공개 부계정에 올릴 엽사나 오글거리는 글을 실수로 본계정 스토리에 올림.' },
  { id: 'e1-8', type: 'E1_IBULKICK', place: '운동장', target: '체육쌤', situation: '복장 불량', emotion: '당황', context: '체육복 바지를 거꾸로 입거나, 티셔츠를 뒤집어 입고 하루 종일 돌아다님.' },
  { id: 'e1-9', type: 'E1_IBULKICK', place: '교실 청소', target: '기물', situation: '파손', emotion: '공포', context: '빗자루질 하다가 교실 TV 건드려서 흔들리거나, 선생님 화분 깸.' },
  { id: 'e1-10', type: 'E1_IBULKICK', place: '버스/등굣길', target: '기사님/승객', situation: '카드 잔액 부족', emotion: '다급', context: '등교 버스 탔는데 "잔액이 부족합니다" 크게 울림. 뒤에 줄 서 있는데 카드 안 찍힘.' },
  { id: 'e1-11', type: 'E1_IBULKICK', place: '수업 시간', target: '선생님', situation: '잠꼬대', emotion: '반 전체 주목', context: '졸다가 나도 모르게 크게 "네!!" 하고 대답하거나 이상한 잠꼬대 함.' },
  { id: 'e1-12', type: 'E1_IBULKICK', place: '화장실', target: '친구', situation: '문 안 잠금', emotion: '비명', context: '화장실 문 잠그는 거 깜빡했는데 친구가 벌컥 엶. 서로 아이컨택.' },
  { id: 'e1-13', type: 'E1_IBULKICK', place: '매점', target: '매점 이모', situation: '계산 실수', emotion: '머쓱', context: '지갑 두고 와서 빵 들고 서 있다가 친구한테 돈 빌리러 뛰어감.' },
  { id: 'e1-14', type: 'E1_IBULKICK', place: '강당', target: '교장선생님', situation: '조회 시간', emotion: '시선 집중', context: '교장쌤 훈화 말씀 중에 너무 조용한데 재채기가 엄청 크게 나옴.' },
  { id: 'e1-15', type: 'E1_IBULKICK', place: '복도', target: '모르는 선배', situation: '아는 척', emotion: '도망', context: '친구인 줄 알고 등짝 스매싱 날렸는데 모르는 무서운 선배였음.' },

  // --- E2: 고구마 (Frustration/Villain) 15 ---
  { id: 'e2-1', type: 'E2_GOGUMA', place: '조별 과제', target: '조원', situation: '무임승차', emotion: '살인충동', context: 'PPT 만드는 날 "나 학원 가야 돼" 하고 튀는 애, 자료조사 나무위키 복붙한 애.' },
  { id: 'e2-2', type: 'E2_GOGUMA', place: '시험 기간', target: '선생님', situation: '시험 범위 변경', emotion: '배신감', context: '시험 하루 전날 갑자기 시험 범위 추가하거나 변경한다고 공지하는 쌤.' },
  { id: 'e2-3', type: 'E2_GOGUMA', place: '독서실', target: '빌런', situation: '소음', emotion: '집중력 파괴', context: '옆자리에서 3색 볼펜 딱딱거리고 다리 떨어서 책상 흔들림. 콧물 훌쩍이.' },
  { id: 'e2-4', type: 'E2_GOGUMA', place: '급식실', target: '선배/후배', situation: '새치기', emotion: '분노', context: '맛있는 메뉴 나오는 날, 뻔뻔하게 친구인 척 줄 중간에 끼어드는 새치기범.' },
  { id: 'e2-5', type: 'E2_GOGUMA', place: '교실', target: '선생님', situation: '내로남불', emotion: '억울', context: '우리보고는 "떠들지 마, 폰 내" 해놓고 자습 시간에 본인은 폰 보고 크게 통화함.' },
  { id: 'e2-6', type: 'E2_GOGUMA', place: '체육 시간', target: '도둑', situation: '물건 분실', emotion: '황당', context: '체육복, 샤프심, 지우개 빌려 가놓고 절대 안 돌려줌. 내껀데 자기 거라고 우김.' },
  { id: 'e2-7', type: 'E2_GOGUMA', place: '친구 관계', target: '여우 친구', situation: '가스라이팅', emotion: '손절 고민', context: '내 썸남한테 은근히 꼬리치거나, 여러 명 있을 때 나 깎아내리는 친구.' },
  { id: 'e2-8', type: 'E2_GOGUMA', place: '수행평가', target: '선생님', situation: '기준 모호', emotion: '답답', context: '채점 기준이 너무 주관적이라 따지러 갔는데 "내 말이 맞아" 시전하는 쌤.' },
  { id: 'e2-9', type: 'E2_GOGUMA', place: '매점', target: '친구', situation: '한입충', emotion: '짜증', context: '내가 사온 빵이랑 우유, "한 입만"이라면서 절반을 먹어 치움.' },
  { id: 'e2-10', type: 'E2_GOGUMA', place: '버스', target: '커플', situation: '애정행각', emotion: '안본눈삼', context: '등하교 버스 안에서 너무 시끄럽게 굴거나 과한 스킨십 하는 커플.' },
  { id: 'e2-11', type: 'E2_GOGUMA', place: '교실', target: '에어컨 빌런', situation: '온도 조절', emotion: '더움/추움', context: '다 더운데 혼자 춥다고 에어컨 끄거나, 다 추운데 혼자 덥다고 18도로 맞추는 애.' },
  { id: 'e2-12', type: 'E2_GOGUMA', place: '동아리', target: '부장', situation: '독재', emotion: '탈주 각', context: '동아리 축제 준비하는데 자기 의견만 고집하고 남의 의견 묵살하는 부장.' },
  { id: 'e2-13', type: 'E2_GOGUMA', place: '청소 시간', target: '농땡이', situation: '혼자 청소', emotion: '억울', context: '청소 당번인데 화장실 간다고 하고 끝날 때까지 안 오는 친구.' },
  { id: 'e2-14', type: 'E2_GOGUMA', place: '교무실', target: '학생부장', situation: '복장 단속', emotion: '짜증', context: '다른 애들은 봐주면서 나한테만 치마 길이, 머리 길이로 뭐라 함.' },
  { id: 'e2-15', type: 'E2_GOGUMA', place: '집', target: '부모님', situation: '비교', emotion: '서러움', context: '엄친아/엄친딸 얘기 꺼내면서 "누구는 1등 했다더라" 비교 시전.' },

  // --- E3: 현타 (Depression/Reality Check) 15 ---
  { id: 'e3-1', type: 'E3_HYEONTA', place: '성적표 배부', target: '나 자신', situation: '노력의 배신', emotion: '무기력', context: '진짜 이번엔 밤새서 공부했는데 등급이 그대로거나 오히려 떨어짐.' },
  { id: 'e3-2', type: 'E3_HYEONTA', place: '인스타그램', target: '금수저 친구', situation: '상대적 박탈감', emotion: '부러움', context: '나는 학원 숙제에 찌들어 있는데, 방학이라고 해외여행 가서 명품 산 친구 스토리 봄.' },
  { id: 'e3-3', type: 'E3_HYEONTA', place: '진로 상담', target: '담임 쌤', situation: '팩트 폭격', emotion: '상처', context: '상담 때 "너 이 성적으로는 거기 절대 못 가"라는 말을 너무 차갑게 들어서 멘탈 터짐.' },
  { id: 'e3-4', type: 'E3_HYEONTA', place: '교실', target: '재능충', situation: '재능의 벽', emotion: '열등감', context: '수학이나 미술, 체육 등에서 나는 죽어라 해도 안 되는데, 놀면서 1등 하는 친구 봄.' },
  { id: 'e3-5', type: 'E3_HYEONTA', place: '야자 시간', target: '미래', situation: '진로 미아', emotion: '막막함', context: '다들 꿈이 있고 목표가 있는데, 나만 뭘 하고 싶은지 모르겠고 잉여 인간 같음.' },
  { id: 'e3-6', type: 'E3_HYEONTA', place: '친구 관계', target: '베프', situation: '멀어짐', emotion: '외로움', context: '가장 친했던 친구가 다른 무리랑 어울리면서 나랑 서서히 멀어지는 게 느껴짐.' },
  { id: 'e3-7', type: 'E3_HYEONTA', place: '집', target: '부모님', situation: '경제적 사정', emotion: '죄송함', context: '부모님이 학원비 때문에 한숨 쉬시는 걸 우연히 듣게 됨.' },
  { id: 'e3-8', type: 'E3_HYEONTA', place: '수학 시간', target: '칠판', situation: '이해 불가', emotion: '멍함', context: '선생님이 열정적으로 설명하는데 하나도 이해가 안 돼서 "난 멍청한가" 생각듦.' },
  { id: 'e3-9', type: 'E3_HYEONTA', place: '축제/행사', target: '군중 속 고독', situation: '소외감', emotion: '우울', context: '학교 축제 때 다들 신나 보이는데 나만 같이 다닐 친구 없어서 화장실에 숨어 있음.' },
  { id: 'e3-10', type: 'E3_HYEONTA', place: '거울 앞', target: '외모', situation: '자존감 하락', emotion: '속상', context: '피부 트러블 심해지고 살쪄서 교복 핏 안 나올 때, 예쁜 친구랑 비교됨.' },
  { id: 'e3-11', type: 'E3_HYEONTA', place: '모의고사 날', target: '시간', situation: 'D-Day', emotion: '공포', context: '칠판에 적힌 수능 D-Day 숫자가 줄어드는 걸 보고 숨이 턱 막힘.' },
  { id: 'e3-12', type: 'E3_HYEONTA', place: '수행평가', target: '팀플', situation: '민폐 걱정', emotion: '자책', context: '내가 너무 못해서 조원들한테 피해 주는 것 같아서 너무 미안하고 위축됨.' },
  { id: 'e3-13', type: 'E3_HYEONTA', place: '쉬는 시간', target: '대화', situation: '끼지 못함', emotion: '투명인간', context: '친구들끼리 자기들만 아는 얘기로 웃고 떠드는데 나만 무슨 말인지 몰라서 가만히 있음.' },
  { id: 'e3-14', type: 'E3_HYEONTA', place: '학원', target: '레벨 테스트', situation: '강등', emotion: '좌절', context: '학원 레벨 테스트 망쳐서 반 강등 당하고 자존심 상함.' },
  { id: 'e3-15', type: 'E3_HYEONTA', place: '잠들기 전', target: '하루', situation: '후회', emotion: '허무', context: '오늘 하루 종일 폰만 보고 공부 하나도 안 한 나 자신을 발견하고 현타 옴.' },

  // --- E4: 소확행 (Small Happiness/Joy) 15 ---
  { id: 'e4-1', type: 'E4_SOHWAKHAENG', place: '급식실', target: '석식', situation: '특식 나오는 날', emotion: '행복', context: '석식으로 마라탕이나 랍스터, 스파게티 등 레전드 메뉴 나옴. 급식실 뛰어감.' },
  { id: 'e4-2', type: 'E4_SOHWAKHAENG', place: '시험 시간', target: 'OMR', situation: '찍신 강림', emotion: '짜릿', context: '모르는 문제 3개 연속으로 찍었는데 채점해 보니 다 맞음.' },
  { id: 'e4-3', type: 'E4_SOHWAKHAENG', place: '매점', target: '빵', situation: '득템', emotion: '뿌듯', context: '매점에서 제일 인기 있는 품절 대란 빵(포켓몬빵 등)을 운 좋게 마지막 하나 겟함.' },
  { id: 'e4-4', type: 'E4_SOHWAKHAENG', place: '교실', target: '선생님', situation: '휴강/자습', emotion: '환호', context: '제일 싫어하는 과목 쌤이 출장 가시거나 아프셔서 자습 줌. 반 전체 환호.' },
  { id: 'e4-5', type: 'E4_SOHWAKHAENG', place: '복도', target: '무서운 쌤', situation: '칭찬', emotion: '감동', context: '평소에 무섭고 깐깐한 쌤이 지나가다가 "너 요즘 열심히 하더라?" 하고 툭 던지고 감.' },
  { id: 'e4-6', type: 'E4_SOHWAKHAENG', place: '야자 시간', target: '일탈', situation: '몰래 째기', emotion: '스릴', context: '야자 감독 쌤 눈 피해서 친구랑 몰래 학교 탈출해서 코인노래방이나 떡볶이 먹으러 감.' },
  { id: 'e4-7', type: 'E4_SOHWAKHAENG', place: '덕질', target: '최애', situation: '티켓팅/포카', emotion: '승리', context: '최애 콘서트 티켓팅 성공하거나, 앨범 깡 했는데 원하던 포카 나옴.' },
  { id: 'e4-8', type: 'E4_SOHWAKHAENG', place: '수업 시간', target: '간식', situation: '몰래 먹기', emotion: '꿀맛', context: '수업 시간에 선생님 몰래 친구랑 쪽지 주고받거나 간식 까먹는 거 성공함.' },
  { id: 'e4-9', type: 'E4_SOHWAKHAENG', place: '체육대회', target: '반 친구들', situation: '우승/응원', emotion: '소속감', context: '우리 반이 계주에서 역전승하거나, 짝남/짝녀가 나 응원해 줌.' },
  { id: 'e4-10', type: 'E4_SOHWAKHAENG', place: '하굣길', target: '날씨', situation: '노을', emotion: '감성', context: '힘든 하루 마치고 나오는데 노을이 너무 예뻐서 친구랑 사진 찍음.' },
  { id: 'e4-11', type: 'E4_SOHWAKHAENG', place: '성적 확인', target: '수행평가', situation: '만점', emotion: '안도', context: '걱정했던 수행평가 점수 확인했는데 감점 없이 만점 받음.' },
  { id: 'e4-12', type: 'E4_SOHWAKHAENG', place: '교실', target: '자리 바꾸기', situation: '꿀자리', emotion: '나이스', context: '자리 뽑기 했는데 창가 쪽 맨 뒤나 짝남/짝녀 근처, 혹은 에어컨 명당 걸림.' },
  { id: 'e4-13', type: 'E4_SOHWAKHAENG', place: '주말', target: '잠', situation: '늦잠', emotion: '개운', context: '토요일 아침 알람 없이 오후까지 푹 자고 일어났을 때의 상쾌함.' },
  { id: 'e4-14', type: 'E4_SOHWAKHAENG', place: '동아리', target: '후배', situation: '존경', emotion: '으쓱', context: '동아리 후배들이 "선배님 멋있어요" 하면서 잘 따를 때.' },
  { id: 'e4-15', type: 'E4_SOHWAKHAENG', place: '학교', target: '방송', situation: '단축 수업', emotion: '광기', context: '수능 전날이나 행사 날, "오늘 4교시만 하고 하교합니다" 방송 나올 때.' },
];
