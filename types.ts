
export type CategoryId =
  | 'ALL'
  | 'MY_PROFS'        // 나의 교수 (New)
  | 'ELEC_SEMI'       // 전기·전자·반도체
  | 'CS_AI'           // 컴퓨터·SW·AI
  | 'MECH_ROBOT'      // 기계·로봇·모빌리티
  | 'CHEM_MAT'        // 화학·에너지·신소재
  | 'BIO_MED'         // 생명·바이오·의약
  | 'BIZ_ECON'        // 경영·경제·통계
  | 'SOC_MEDIA'       // 사회과학·미디어·심리
  | 'HUM_EDU'         // 인문·어문·교육
  | 'BREAK';          // 쉬는시간 (New)

export type GradeType = 'ALL' | 'MIDDLE' | 'H1' | 'H2' | 'H3' | 'ADULT';

export interface Category {
  id: CategoryId;
  name: string;
  icon?: string;
}

export interface MajorDetail {
  id: CategoryId;
  description: string; // "어떤 곳인가요?"
  whatWeLearn: string[]; // "무엇을 배우나요?" (주요 과목 및 설명)
  careerPath: string; // "졸업 후 진로 / 석박사 세부전공"
  recommendations: string[]; // "이런 학생에게 추천해요" (3가지 핵심)
}

export interface Professor {
  id: string;
  categoryId: CategoryId;
  name: string;
  title: string; // e.g. "전자공학부 교수"
  imageUrl: string;
  introduction: string;
  hashTags: string[];
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  grade?: GradeType; // Added grade
  isAdmin?: boolean;
  points?: number; // Added points for leaderboard
  hopeMajor?: string;
  careerGoal?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface Agent {
  id: string;
  nickname: string;
  major_category: string;
  role_type: string;
  grade?: string;
}

export interface Comment {
  id: number | string;
  agentId?: string;
  agentName: string;
  role: string;
  text: string;
  likes: number;
  createdAt: string;
  isUser?: boolean;
  uid?: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  categoryId: CategoryId;
  authorAgent: string;
  authorRole: string;
  title: string;
  content: string;
  previewText: string;
  comments: Comment[];
  commentCount?: number; // [Pagination] Feed 목록에서 댓글 개수만 표시할 때 사용
  viewCount: number;
  likeCount: number;
  createdAt: string;
  timestamp?: any;
  tags: string[];
  isUser?: boolean;
  uid?: string;
  targetGrade?: GradeType; // Added for filtering
  episodeType?: string; // E1, E2, E3, E4 for Break posts
  targetProfessorId?: string; // [New] 특정 교수님 대상 질문글 (상담소용)
}

export interface Quiz {
  id: string;
  type: 'FACT_CHECK' | 'INFERENCE';
  question: string;
  options: string[];
  answer: number; // 0-4 index
  explanation: string;
  correctRate?: number; // Simulated correct rate (e.g., 68%)
}

export interface TrendItem {
  id: string;
  title: string;
  summary: string[];
  targetMajor: string;
  keyword: string;
  imageUrl: string;
  content: string;
  seTeukTip: string;
  comments: Comment[];
  viewCount: number;
  likeCount: number;
  createdAt: string;
  timestamp?: any;
  quizzes?: Quiz[]; // Added Quizzes
}

export interface VoteItem {
  id: string;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  likeCount: number;
  comments: Comment[];
  timestamp?: any;
  myVote?: 'A' | 'B'; // Added: Current user's vote status
}

export interface CounselingData {
  postId: string;
  postTitle: string;
  targetProfessorId: string;
  professorName: string;
  professorComment: string;
  assistantComments: { name: string, text: string }[];
}

export type ScenarioType = 'FEED' | 'TREND' | 'VOTE' | 'COUNSELING';

export interface PendingScenario {
  id: string;
  type: ScenarioType;

  postData?: Post;
  trendData?: TrendItem;
  voteData?: VoteItem;
  counselingData?: CounselingData;

  pendingComments: Comment[];
  isApproved: boolean;
  linkedId?: string;
}

export interface LeaderboardUser {
  rank: number;
  nickname: string;
  points: number;
  photoURL?: string;
  isUser?: boolean;
}

export interface SchoolLeaderboard {
  schoolId: string;
  schoolName: string;
  region: string;
  totalPoints: number;
  rank: number;
}

export interface UserRank {
  rank: number;
  totalPoints: number;
  correctCount: number;
  totalCount: number;
}

export interface DailyScore {
  score_date: string;    // 'YYYY-MM-DD'
  points: number;
  correct_count: number;
  total_count: number;
}
