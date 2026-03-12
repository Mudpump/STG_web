
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment, TrendItem, VoteItem, PendingScenario, User, GradeType, CategoryId, LeaderboardUser, SchoolLeaderboard, UserRank, DailyScore } from '../types';
import { runAgentChain, runTrendAgents, runVoteAgents, runCustomAgentChain, runSourceTrendAgents, runRoadmapAgentChain, runSearchTrendAgents, runProfessorAgent, runCounselingAgent } from '../agents';
import { runEpisodeAgent } from '../agents/episodeAgents';
import { EPISODE_RECIPES } from '../data/episodeData';
import { supabase } from '../utils/supabase';
import { formatTimeAgo } from '../utils/dateUtils';
import { getKSTDateString, getKSTMonday, toKSTDateString } from '../utils/kstDateUtils';
import { CATEGORIES, PROFESSORS } from '../constants'; // Import CATEGORIES for iteration
import { ProfessorTheme } from '../agents/professorAgents'; // Type import


// Import Dummy Data
import { FEED_DATA } from '../data/feedData';
import { ARCHIVE_DATA } from '../data/archiveData';
import { ARENA_DATA } from '../data/arenaData';

interface StoreContextType {
  // Auth
  currentUser: User | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pw: string) => Promise<void>;
  signupWithEmail: (email: string, pw: string, nickname: string, grade: GradeType) => Promise<void>;
  checkNickname: (nickname: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => void;

  // Login Modal State
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Gamification
  addPoints: (amount: number) => void;
  leaderboard: { WEEKLY: LeaderboardUser[], MONTHLY: LeaderboardUser[] };
  schoolLeaderboard: { WEEKLY: SchoolLeaderboard[], MONTHLY: SchoolLeaderboard[] };
  userRank: { WEEKLY: UserRank | null, MONTHLY: UserRank | null };
  weeklyProgress: DailyScore[];
  fetchWeeklyProgress: (uid?: string) => Promise<void>;
  submitQuizAnswer: (trendId: string, quizIndex: number, isCorrect: boolean) => Promise<number>;
  fetchLeaderboard: () => Promise<void>;

  posts: Post[];
  fetchPosts: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'viewCount' | 'likeCount' | 'comments' | 'authorRole'>) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, text: string) => void;
  addPostReply: (postId: string, parentCommentId: number | string, text: string) => void;
  deleteComment: (postId: string, commentId: number | string) => void;
  fetchPostComments: (postId: string) => Promise<void>;

  // [Pagination] Feed 전용 페이지네이션
  feedPosts: Post[];
  feedHasMore: boolean;
  feedLoading: boolean;
  fetchFeedPosts: (params: { page: number; categoryId?: CategoryId; sortBy?: 'LATEST' | 'POPULAR'; filterGrade?: GradeType; followedProfessorIds?: Set<string> }) => Promise<void>;
  resetFeedPosts: () => void;

  trends: TrendItem[];
  fetchTrends: () => Promise<void>;
  addTrend: (trend: Omit<TrendItem, 'id' | 'createdAt' | 'viewCount' | 'likeCount' | 'comments'>) => void;
  deleteTrend: (id: string) => void;
  addTrendComment: (trendId: string, text: string) => void;
  addTrendReply: (trendId: string, parentCommentId: number | string, text: string) => void;
  deleteTrendComment: (trendId: string, commentId: number | string) => void;
  fetchTrendComments: (trendId: string) => Promise<void>;

  // [Pagination] Trend 리스트 전용
  trendListItems: TrendItem[];
  trendHasMore: boolean;
  trendLoading: boolean;
  fetchTrendList: (params: { page: number }) => Promise<void>;
  resetTrendList: () => void;

  votes: VoteItem[];
  fetchVotes: () => Promise<void>;
  addVote: (vote: Omit<VoteItem, 'id' | 'votesA' | 'votesB' | 'comments' | 'likeCount'>) => void;
  deleteVote: (id: string) => void;
  castVote: (voteId: string, choice: 'A' | 'B') => void; // New method
  addVoteComment: (voteId: string, text: string) => void;
  addVoteReply: (voteId: string, parentCommentId: number | string, text: string) => void;
  deleteVoteComment: (voteId: string, commentId: number | string) => void;
  fetchVoteComments: (voteId: string) => Promise<void>;

  // [Pagination] Vote 리스트 전용
  voteListItems: VoteItem[];
  voteHasMore: boolean;
  voteLoading: boolean;
  fetchVoteList: (params: { page: number }) => Promise<void>;
  resetVoteList: () => void;

  toggleLikePost: (id: string) => void;
  likedPostIds: Set<string>;

  toggleLikeTrend: (id: string) => void;
  likedTrendIds: Set<string>;

  toggleLikeVote: (id: string) => void;
  likedVoteIds: Set<string>;

  toggleSavePost: (id: string) => void;
  savedPostIds: Set<string>;

  toggleLikeComment: (type: 'POST' | 'TREND' | 'VOTE', itemId: string, commentId: number | string) => void;
  likedCommentIds: Set<string>;

  // Follow Professor
  toggleFollowProfessor: (professorId: string) => void;
  followedProfessorIds: Set<string>;

  isAdmin: boolean;
  toggleAdmin: (password?: string) => boolean;

  incrementViewCount: (type: 'POST' | 'TREND', id: string) => void;

  // AI Agent & Staging
  pendingScenarios: PendingScenario[];
  generateAIPost: (onLog: (msg: string) => void, grade?: GradeType, month?: number, keyword?: string, forcedCategory?: CategoryId) => Promise<void>;
  generateAIPostAllCategories: (onLog: (msg: string) => void, grade?: GradeType, month?: number) => Promise<void>;
  generateCustomPost: (onLog: (msg: string) => void, major: string, grade: GradeType, instruction: string) => Promise<void>;
  generateRoadmapPost: (onLog: (msg: string) => void, categoryId: CategoryId, majorName: string, instruction?: string) => Promise<void>;
  generateProfessorPost: (onLog: (msg: string) => void, professorId: string, theme: ProfessorTheme, instruction?: string) => Promise<void>; // New Method
  generateAITrend: (onLog: (msg: string) => void) => Promise<void>;
  generateSourceTrend: (onLog: (msg: string) => void, sourceText: string) => Promise<void>;
  generateSearchTrend: (onLog: (msg: string) => void, keyword?: string) => Promise<void>;
  generateAIVote: (onLog: (msg: string) => void) => Promise<void>;
  generateAIEpisode: (onLog: (msg: string) => void, count: number, seed?: string) => Promise<void>;
  answerCounseling: (postId: string, instruction: string, onLog: (msg: string) => void) => Promise<void>; // New Method

  approveItem: (scenarioId: string) => void;
  approveComment: (scenarioId: string, commentId: number | string) => void;
  discardScenario: (scenarioId: string) => void;
}

let latestFetchPostsId = 0;
let latestFetchTrendsId = 0;
let latestFetchVotesId = 0;

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const updateUserProfile = (data: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };

  // Gamification State (Real DB data)
  const [leaderboard, setLeaderboard] = useState<{ WEEKLY: LeaderboardUser[], MONTHLY: LeaderboardUser[] }>({
    WEEKLY: [], MONTHLY: []
  });
  const [schoolLeaderboard, setSchoolLeaderboard] = useState<{ WEEKLY: SchoolLeaderboard[], MONTHLY: SchoolLeaderboard[] }>({
    WEEKLY: [], MONTHLY: []
  });
  const [userRank, setUserRank] = useState<{ WEEKLY: UserRank | null, MONTHLY: UserRank | null }>({
    WEEKLY: null, MONTHLY: null
  });
  const [weeklyProgress, setWeeklyProgress] = useState<DailyScore[]>([]);

  // Data State - Initialize with Dummy Data immediately!
  const [posts, setPosts] = useState<Post[]>(FEED_DATA);
  const [trends, setTrends] = useState<TrendItem[]>(ARCHIVE_DATA);
  const [votes, setVotes] = useState<VoteItem[]>(ARENA_DATA);

  // [Pagination] Feed 전용 상태
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  // [Pagination] Trend 리스트 전용 상태
  const [trendListItems, setTrendListItems] = useState<TrendItem[]>([]);
  const [trendHasMore, setTrendHasMore] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);

  // [Pagination] Vote 리스트 전용 상태
  const [voteListItems, setVoteListItems] = useState<VoteItem[]>([]);
  const [voteHasMore, setVoteHasMore] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingScenarios, setPendingScenarios] = useState<PendingScenario[]>([]);

  // Local interaction state
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [likedTrendIds, setLikedTrendIds] = useState<Set<string>>(new Set());
  const [likedVoteIds, setLikedVoteIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [followedProfessorIds, setFollowedProfessorIds] = useState<Set<string>>(new Set()); // New State

  // Helper: Build Comment Tree from flat DB array
  const buildCommentTree = (flatComments: any[]): Comment[] => {
    if (!flatComments || flatComments.length === 0) return [];

    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    const sorted = [...flatComments].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach(c => {
      const comment: Comment = {
        id: c.id,
        agentName: c.agent_name,
        role: c.role,
        text: c.text,
        likes: c.likes || 0,
        createdAt: formatTimeAgo(c.created_at),
        isUser: c.is_user,
        uid: c.uid,
        replies: []
      };
      commentMap.set(c.id, comment);
    });

    sorted.forEach(c => {
      const comment = commentMap.get(c.id);
      if (comment) {
        if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
          const parent = commentMap.get(c.parent_comment_id);
          parent?.replies?.push(comment);
        } else {
          roots.push(comment);
        }
      }
    });

    return roots;
  };

  // 1. Fetch Posts
  const fetchPosts = async () => {
    const currentFetchId = ++latestFetchPostsId;
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      let loadedPosts: Post[] = [];

      if (!postsError && postsData) {
        // [FIX] Load recent comments first to prevent "0 comments" issue on feed
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false }); // Sort DESC to get latest

        const allComments = commentsData || [];

        loadedPosts = postsData.map((d: any) => ({
          id: d.id,
          categoryId: d.category_id,
          authorAgent: d.author_agent,
          authorRole: d.author_role,
          authorAvatarId: d.author_avatar_id, // Added author_avatar_id
          title: d.title,
          content: d.content,
          previewText: d.preview_text,
          comments: buildCommentTree(allComments.filter((c: any) => c.post_id === d.id)),
          viewCount: d.view_count || 0,
          likeCount: d.like_count || 0,
          createdAt: formatTimeAgo(d.created_at),
          tags: d.tags || [],
          isUser: d.is_user,
          uid: d.uid,
          targetGrade: d.target_grade || 'ALL',
          episodeType: d.episode_type,
          targetProfessorId: d.target_professor_id // [New] Map DB column
        }));
      }

      if (currentFetchId !== latestFetchPostsId) return;

      // Merge DB posts with Dummy posts (Ensure Dummy posts are always present)
      setPosts(prev => {
        const tempPosts = prev.filter(p => String(p.id).startsWith('temp-'));
        const newPosts = [...tempPosts, ...loadedPosts, ...FEED_DATA];
        const seen = new Set();
        return newPosts.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      });

    } catch (e) { console.error(e); }
  };

  // [NEW] Fetch Specific Post Comments (Structural Improvement)
  const fetchPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Comments chronological

      if (!error && data) {
        const commentTree = buildCommentTree(data);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, comments: commentTree } : p
        ));
      }
    } catch (e) {
      console.error("Error fetching specific post comments:", e);
    }
  };

  const fetchTrendComments = async (trendId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('trend_id', trendId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setTrends(prev => prev.map(t =>
          t.id === trendId ? { ...t, comments: buildCommentTree(data) } : t
        ));
      }
    } catch (e) { console.error(e); }
  };

  const fetchVoteComments = async (voteId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('vote_id', voteId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setVotes(prev => prev.map(v =>
          v.id === voteId ? { ...v, comments: buildCommentTree(data) } : v
        ));
      }
    } catch (e) { console.error(e); }
  };

  // [Pagination] Feed 전용 페이지네이션 함수
  const FEED_PAGE_SIZE = 20;

  const fetchFeedPosts = async (params: {
    page: number;
    categoryId?: CategoryId;
    sortBy?: 'LATEST' | 'POPULAR';
    filterGrade?: GradeType;
    followedProfessorIds?: Set<string>;
  }) => {
    setFeedLoading(true);
    try {
      const from = (params.page - 1) * FEED_PAGE_SIZE;
      const to = from + FEED_PAGE_SIZE - 1;

      let query = supabase
        .from('posts')
        .select('id, category_id, author_agent, author_role, author_avatar_id, title, content, preview_text, view_count, like_count, created_at, tags, is_user, uid, target_grade, episode_type, target_professor_id', { count: 'exact' });

      // MY_PROFS: 팔로우 교수의 글만
      if (params.categoryId === 'MY_PROFS') {
        const ids = Array.from(params.followedProfessorIds || []);
        if (ids.length > 0) {
          query = query.eq('author_role', 'Professor').in('target_professor_id', ids);
        } else {
          // 팔로우한 교수 없으면 빈 결과
          setFeedPosts(prev => params.page === 1 ? [] : prev);
          setFeedHasMore(false);
          setFeedLoading(false);
          return;
        }
      } else {
        // 일반 피드: 교수님 글/상담 글 제외
        query = query.is('target_professor_id', null).neq('author_role', 'Professor');
        if (params.categoryId && params.categoryId !== 'ALL') {
          query = query.eq('category_id', params.categoryId);
        }
      }

      // 학년 필터
      if (params.filterGrade && params.filterGrade !== 'ALL') {
        query = query.or(`target_grade.eq.${params.filterGrade},target_grade.eq.ALL,target_grade.is.null`);
      }

      // 정렬
      if (params.sortBy === 'POPULAR') {
        query = query.order('like_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, count, error } = await query.range(from, to);

      if (error) {
        console.error('Feed pagination error:', error);
        setFeedLoading(false);
        return;
      }

      // 댓글 개수 개별 조회 (피드 목록용)
      const postIds = (data || []).map((d: any) => d.id);
      let commentCounts: Record<string, number> = {};
      if (postIds.length > 0) {
        const { data: ccData } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds);
        if (ccData) {
          ccData.forEach((c: any) => {
            commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
          });
        }
      }

      const mappedPosts: Post[] = (data || []).map((d: any) => ({
        id: d.id,
        categoryId: d.category_id,
        authorAgent: d.author_agent,
        authorRole: d.author_role,
        title: d.title,
        content: d.content,
        previewText: d.preview_text,
        comments: [],
        commentCount: commentCounts[d.id] || 0,
        viewCount: d.view_count || 0,
        likeCount: d.like_count || 0,
        createdAt: formatTimeAgo(d.created_at),
        tags: d.tags || [],
        isUser: d.is_user,
        uid: d.uid,
        targetGrade: d.target_grade || 'ALL',
        episodeType: d.episode_type,
        targetProfessorId: d.target_professor_id
      }));

      // [FIX] 동기화 문제 해결: Feed 목록에 있는 게시글이 전역 posts에 즉시 반영되도록 병합
      setPosts(prev => {
        let updated = false;
        const newPosts = [...prev];
        mappedPosts.forEach(mp => {
          if (!newPosts.some(p => p.id.toString() === mp.id.toString())) {
            newPosts.push(mp);
            updated = true;
          }
        });
        return updated ? newPosts : prev;
      });

      // 첫 페이지: Dummy Data 병합 + 새로 세팅 / 이후 페이지: 기존에 append
      if (params.page === 1) {
        // Dummy data도 같은 필터 조건 적용
        let dummyFiltered = FEED_DATA.filter(p => !p.targetProfessorId && p.authorRole?.toLowerCase() !== 'professor');
        if (params.categoryId && params.categoryId !== 'ALL' && params.categoryId !== 'MY_PROFS') {
          dummyFiltered = dummyFiltered.filter(p => p.categoryId === params.categoryId);
        }
        if (params.categoryId === 'MY_PROFS') {
          dummyFiltered = []; // dummy data에는 MY_PROFS 없음
        }
        if (params.filterGrade && params.filterGrade !== 'ALL') {
          dummyFiltered = dummyFiltered.filter(p => p.targetGrade === params.filterGrade || p.targetGrade === 'ALL' || !p.targetGrade);
        }
        if (params.sortBy === 'POPULAR') {
          dummyFiltered.sort((a, b) => b.likeCount - a.likeCount);
        }
        setFeedPosts([...mappedPosts, ...dummyFiltered]);
      } else {
        setFeedPosts(prev => [...prev, ...mappedPosts]);
      }

      // hasMore 판별
      const totalCount = (count || 0) + (params.page === 1 ? FEED_DATA.length : 0);
      const loadedSoFar = params.page * FEED_PAGE_SIZE;
      setFeedHasMore(loadedSoFar < (count || 0));
    } catch (e) {
      console.error('Feed pagination error:', e);
    } finally {
      setFeedLoading(false);
    }
  };

  const resetFeedPosts = () => {
    setFeedPosts([]);
    setFeedHasMore(true);
    setFeedLoading(false);
  };

  // [Pagination] Trend 리스트 전용 페이지네이션 함수
  const TREND_PAGE_SIZE = 20;

  const fetchTrendList = async (params: { page: number }) => {
    setTrendLoading(true);
    try {
      const from = (params.page - 1) * TREND_PAGE_SIZE;
      const to = from + TREND_PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from('trends')
        .select('id, title, summary, target_major, keyword, image_url, content, se_teuk_tip, view_count, like_count, created_at, quizzes', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Trend list pagination error:', error);
        setTrendLoading(false);
        return;
      }

      // 댓글 개수만 조회 (본문 불필요)
      const trendIds = (data || []).map((d: any) => d.id);
      let commentCounts: Record<string, number> = {};
      if (trendIds.length > 0) {
        const { data: ccData } = await supabase
          .from('comments')
          .select('trend_id')
          .in('trend_id', trendIds);
        if (ccData) {
          ccData.forEach((c: any) => {
            commentCounts[c.trend_id] = (commentCounts[c.trend_id] || 0) + 1;
          });
        }
      }

      const mappedTrends: TrendItem[] = (data || []).map((d: any) => ({
        id: d.id, title: d.title, summary: d.summary || [], targetMajor: d.target_major, keyword: d.keyword, imageUrl: d.image_url,
        content: d.content, seTeukTip: d.se_teuk_tip, comments: [],
        commentCount: commentCounts[d.id] || 0,
        viewCount: d.view_count || 0, likeCount: d.like_count || 0, createdAt: formatTimeAgo(d.created_at), quizzes: d.quizzes
      }));

      // [FIX] 동기화 문제 해결: Trend 목록에 있는 게시물이 전역 trends에 즉시 반영되도록 병합
      setTrends(prev => {
        let updated = false;
        const newTrends = [...prev];
        mappedTrends.forEach(mt => {
          if (!newTrends.some(t => t.id.toString() === mt.id.toString())) {
            newTrends.push(mt);
            updated = true;
          }
        });
        return updated ? newTrends : prev;
      });

      if (params.page === 1) {
        setTrendListItems([...mappedTrends, ...ARCHIVE_DATA]);
      } else {
        setTrendListItems(prev => [...prev, ...mappedTrends]);
      }

      setTrendHasMore((params.page * TREND_PAGE_SIZE) < (count || 0));
    } catch (e) {
      console.error('Trend list pagination error:', e);
    } finally {
      setTrendLoading(false);
    }
  };

  const resetTrendList = () => {
    setTrendListItems([]);
    setTrendHasMore(true);
    setTrendLoading(false);
  };

  // [Pagination] Vote 리스트 전용 페이지네이션 함수
  const VOTE_PAGE_SIZE = 20;

  const fetchVoteList = async (params: { page: number }) => {
    setVoteLoading(true);
    try {
      const from = (params.page - 1) * VOTE_PAGE_SIZE;
      const to = from + VOTE_PAGE_SIZE - 1;

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData.session?.user?.id;

      const { data, count, error } = await supabase
        .from('votes')
        .select('id, title, description, option_a, option_b, votes_a, votes_b, like_count, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Vote list pagination error:', error);
        setVoteLoading(false);
        return;
      }

      // 댓글 개수만 조회
      const voteIds = (data || []).map((d: any) => d.id);
      let commentCounts: Record<string, number> = {};
      if (voteIds.length > 0) {
        const { data: ccData } = await supabase
          .from('comments')
          .select('vote_id')
          .in('vote_id', voteIds);
        if (ccData) {
          ccData.forEach((c: any) => {
            commentCounts[c.vote_id] = (commentCounts[c.vote_id] || 0) + 1;
          });
        }
      }

      // 투표 이력 조회
      let userHistory: any[] = [];
      if (currentUid) {
        const { data: hData } = await supabase.from('vote_history').select('vote_id, choice').eq('user_id', currentUid);
        userHistory = hData || [];
      }

      const mappedVotes: VoteItem[] = (data || []).map((d: any) => {
        const historyItem = userHistory.find(h => h.vote_id === d.id);
        return {
          id: d.id, title: d.title, description: d.description, optionA: d.option_a, optionB: d.option_b,
          votesA: d.votes_a || 0, votesB: d.votes_b || 0, likeCount: d.like_count || 0, comments: [],
          commentCount: commentCounts[d.id] || 0,
          myVote: historyItem ? historyItem.choice as 'A' | 'B' : undefined
        };
      });

      // [FIX] 동기화 문제 해결: Vote 목록에 있는 게시물이 전역 votes에 즉시 반영되도록 병합
      setVotes(prev => {
        let updated = false;
        const newVotes = [...prev];
        mappedVotes.forEach(mv => {
          if (!newVotes.some(v => v.id.toString() === mv.id.toString())) {
            newVotes.push(mv);
            updated = true;
          }
        });
        return updated ? newVotes : prev;
      });

      if (params.page === 1) {
        const mappedArenaData = ARENA_DATA.map(v => {
          const historyItem = userHistory.find(h => h.vote_id === v.id);
          return historyItem ? { ...v, myVote: historyItem.choice as 'A' | 'B' } : v;
        });
        setVoteListItems([...mappedVotes, ...mappedArenaData]);
      } else {
        setVoteListItems(prev => [...prev, ...mappedVotes]);
      }

      setVoteHasMore((params.page * VOTE_PAGE_SIZE) < (count || 0));
    } catch (e) {
      console.error('Vote list pagination error:', e);
    } finally {
      setVoteLoading(false);
    }
  };

  const resetVoteList = () => {
    setVoteListItems([]);
    setVoteHasMore(true);
    setVoteLoading(false);
  };

  // ... (Other Fetch functions same as before) ...
  const fetchTrends = async () => {
    const currentFetchId = ++latestFetchTrendsId;
    try {
      const { data: trendsData, error: trendsError } = await supabase.from('trends').select('*').order('created_at', { ascending: false });
      let loadedTrends: TrendItem[] = [];
      if (!trendsError && trendsData) {
        const { data: commentsData } = await supabase.from('comments').select('*');
        const allComments = commentsData || [];
        loadedTrends = trendsData.map((d: any) => ({
          id: d.id, title: d.title, summary: d.summary || [], targetMajor: d.target_major, keyword: d.keyword, imageUrl: d.image_url,
          content: d.content, seTeukTip: d.se_teuk_tip, comments: buildCommentTree(allComments.filter((c: any) => c.trend_id === d.id)),
          viewCount: d.view_count || 0, likeCount: d.like_count || 0, createdAt: formatTimeAgo(d.created_at), quizzes: d.quizzes
        }));
      }
      if (currentFetchId !== latestFetchTrendsId) return;
      setTrends(prev => {
        const tempTrends = prev.filter(t => String(t.id).startsWith('temp-'));
        const newTrends = [...tempTrends, ...loadedTrends, ...ARCHIVE_DATA];
        const seen = new Set();
        return newTrends.filter(t => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
      });
    } catch (e) { console.error(e); }
  };

  const fetchVotes = async () => {
    const currentFetchId = ++latestFetchVotesId;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData.session?.user?.id;

      const { data: votesData, error: votesError } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
      let finalVotes: VoteItem[] = [];

      if (!votesError && votesData) {
        const { data: commentsData } = await supabase.from('comments').select('*');
        const allComments = commentsData || [];

        let userHistory: any[] = [];
        if (currentUid) {
          const { data: hData } = await supabase.from('vote_history').select('vote_id, choice').eq('user_id', currentUid);
          userHistory = hData || [];
        }

        const loadedVotes = votesData.map((d: any) => {
          const historyItem = userHistory.find(h => h.vote_id === d.id);
          return {
            id: d.id, title: d.title, description: d.description, optionA: d.option_a, optionB: d.option_b,
            votesA: d.votes_a || 0, votesB: d.votes_b || 0, likeCount: d.like_count || 0, comments: buildCommentTree(allComments.filter((c: any) => c.vote_id === d.id)),
            myVote: historyItem ? historyItem.choice as 'A' | 'B' : undefined
          };
        });

        const mappedArenaData = ARENA_DATA.map(v => {
          const historyItem = userHistory.find(h => h.vote_id === v.id);
          return historyItem ? { ...v, myVote: historyItem.choice as 'A' | 'B' } : v;
        });

        finalVotes = [...loadedVotes, ...mappedArenaData];
      }

      if (currentFetchId !== latestFetchVotesId) return;
      if (finalVotes.length > 0) {
        setVotes(prev => {
          const tempVotes = prev.filter(v => String(v.id).startsWith('temp-'));
          const newVotes = [...tempVotes, ...finalVotes];
          const seen = new Set();
          return newVotes.filter(v => {
            if (seen.has(v.id)) return false;
            seen.add(v.id);
            return true;
          });
        });
      } else {
        setVotes(prev => {
          const tempVotes = prev.filter(v => String(v.id).startsWith('temp-'));
          const newVotes = [...tempVotes, ...ARENA_DATA];
          const seen = new Set();
          return newVotes.filter(v => {
            if (seen.has(v.id)) return false;
            seen.add(v.id);
            return true;
          });
        });
      }
    } catch (e) { console.error(e); }
  };

  const fetchFollows = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('follows').select('professor_id').eq('user_id', uid);
      if (error) throw error;
      if (data) {
        const ids = new Set<string>(data.map((d: any) => d.professor_id));
        setFollowedProfessorIds(ids);
      }
    } catch (e) {
      console.warn("Follows table might not exist or error fetching:", e);
      setFollowedProfessorIds(new Set());
    }
  };

  const fetchUserVoteHistory = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('vote_history').select('vote_id, choice').eq('user_id', uid);
      if (error) { console.warn("vote_history fetch error:", error); return; }
      if (data) {
        setVotes(prev => prev.map(v => {
          const history = data.find((h: any) => h.vote_id === v.id);
          if (history) { return { ...v, myVote: history.choice as 'A' | 'B' }; }
          return v;
        }));
      }
    } catch (e) { console.error(e); }
  };

  // --- Leaderboard & Quiz Functions ---
  const getWeekRange = () => {
    // KST 기준 이번 주 월요일 ~ 다음 주 월요일
    const monday = getKSTMonday();
    // 리더보드 RPC에 넘길 때는 실제 UTC 시각으로 변환 (KST 00:00 = UTC 전날 15:00)
    const mondayUTC = new Date(monday.getTime() - 9 * 60 * 60 * 1000);
    const weekEndUTC = new Date(mondayUTC.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: mondayUTC.toISOString(), end: weekEndUTC.toISOString() };
  };

  const getMonthRange = () => {
    // KST 기준 이번 달 1일 ~ 다음 달 1일
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const y = kstNow.getUTCFullYear();
    const m = kstNow.getUTCMonth();
    // KST 1일 00:00 = UTC (1일 - 9시간)
    const monthStartUTC = new Date(Date.UTC(y, m, 1) - 9 * 60 * 60 * 1000);
    const monthEndUTC = new Date(Date.UTC(y, m + 1, 1) - 9 * 60 * 60 * 1000);
    return { start: monthStartUTC.toISOString(), end: monthEndUTC.toISOString() };
  };

  const fetchLeaderboard = async () => {
    try {
      const week = getWeekRange();
      const month = getMonthRange();

      // Fetch weekly & monthly student leaderboard
      const [weeklyRes, monthlyRes] = await Promise.all([
        supabase.rpc('get_leaderboard', { p_start_date: week.start, p_end_date: week.end, p_limit: 10 }),
        supabase.rpc('get_leaderboard', { p_start_date: month.start, p_end_date: month.end, p_limit: 10 })
      ]);

      const mapLeaderboard = (data: any[], uid?: string): LeaderboardUser[] =>
        (data || []).map((d: any) => ({
          rank: d.rank,
          nickname: d.nickname || '학생',
          points: d.total_points || 0,
          photoURL: d.photo_url || null,
          isUser: uid ? d.user_id === uid : false
        }));

      const uid = currentUser?.uid;
      setLeaderboard({
        WEEKLY: mapLeaderboard(weeklyRes.data, uid),
        MONTHLY: mapLeaderboard(monthlyRes.data, uid)
      });

      // Fetch school leaderboard
      const [weeklySchool, monthlySchool] = await Promise.all([
        supabase.rpc('get_school_leaderboard', { p_start_date: week.start, p_end_date: week.end, p_limit: 10 }),
        supabase.rpc('get_school_leaderboard', { p_start_date: month.start, p_end_date: month.end, p_limit: 10 })
      ]);

      const mapSchool = (data: any[]): SchoolLeaderboard[] =>
        (data || []).map((d: any) => ({
          schoolId: d.school_id,
          schoolName: d.school_name || '학교',
          region: d.region || '',
          totalPoints: d.total_points || 0,
          rank: d.rank
        }));

      setSchoolLeaderboard({
        WEEKLY: mapSchool(weeklySchool.data),
        MONTHLY: mapSchool(monthlySchool.data)
      });

      // Fetch user rank
      if (uid) {
        const [weeklyRank, monthlyRank] = await Promise.all([
          supabase.rpc('get_user_rank', { p_user_id: uid, p_start_date: week.start, p_end_date: week.end }),
          supabase.rpc('get_user_rank', { p_user_id: uid, p_start_date: month.start, p_end_date: month.end })
        ]);

        const mapRank = (data: any[]): UserRank | null => {
          if (!data || data.length === 0) return null;
          const d = data[0];
          return { rank: d.rank, totalPoints: d.total_points || 0, correctCount: d.correct_count || 0, totalCount: d.total_count || 0 };
        };

        setUserRank({
          WEEKLY: mapRank(weeklyRank.data),
          MONTHLY: mapRank(monthlyRank.data)
        });
      }
    } catch (e) {
      console.error('Leaderboard fetch error:', e);
    }
  };

  const fetchWeeklyProgress = async (uid?: string) => {
    const userId = uid || currentUser?.uid;
    if (!userId) return;
    try {
      // KST 기준 이번 주 월요일의 날짜 문자열
      const mondayDate = toKSTDateString(getKSTMonday());
      const { data, error } = await supabase
        .from('daily_scores')
        .select('score_date, points, correct_count, total_count')
        .eq('user_id', userId)
        .gte('score_date', mondayDate)
        .order('score_date');

      if (!error && data) {
        setWeeklyProgress(data as DailyScore[]);
      }
    } catch (e) {
      console.error('Weekly progress fetch error:', e);
    }
  };

  const submitQuizAnswer = async (trendId: string, quizIndex: number, isCorrect: boolean): Promise<number> => {
    if (!currentUser) return 0;

    // 1. Check for duplicate
    const { data: existing } = await supabase
      .from('user_answers')
      .select('id')
      .eq('user_id', currentUser.uid)
      .eq('trend_id', trendId)
      .eq('quiz_index', quizIndex)
      .maybeSingle();

    if (existing) {
      // Already answered — no points
      return 0;
    }

    // 2. Calculate points
    const pointsEarned = isCorrect ? 10 : 0;

    // 3. Insert answer record
    const { error: insertError } = await supabase.from('user_answers').insert({
      user_id: currentUser.uid,
      trend_id: trendId,
      quiz_index: quizIndex,
      is_correct: isCorrect,
      points_earned: pointsEarned
    });

    if (insertError) {
      console.error('Quiz answer insert error:', insertError);
      return 0;
    }

    // 4. Update daily_scores via RPC
    const today = getKSTDateString(); // KST 기준 오늘 YYYY-MM-DD
    await supabase.rpc('upsert_daily_score', {
      p_user_id: currentUser.uid,
      p_score_date: today,
      p_points: pointsEarned,
      p_correct: isCorrect ? 1 : 0,
      p_total: 1
    });

    // 5. Increment profile points via RPC
    if (pointsEarned > 0) {
      await supabase.rpc('increment_profile_points', {
        p_user_id: currentUser.uid,
        p_points: pointsEarned
      });

      // Optimistic update local user points
      setCurrentUser(prev => prev ? { ...prev, points: (prev.points || 0) + pointsEarned } : null);
    }

    // 6. Refresh leaderboard & weekly progress
    fetchLeaderboard();
    fetchWeeklyProgress();

    return pointsEarned;
  };

  // ... (Auth & Initialization) ...
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Skip full re-initialization on USER_UPDATED — optimistic update already handled state
        if (event === 'USER_UPDATED') {
          return;
        }


        const user: User = {
          uid: session.user.id,
          displayName: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email?.split('@')[0] || '학생',
          email: session.user.email || null,
          photoURL: session.user.user_metadata.avatar_url || null,
          avatarId: session.user.user_metadata.avatar_id || null, // Add avatar_id from metadata if exists
          grade: session.user.user_metadata.grade || 'ALL',
          points: session.user.user_metadata.points || 0
        };

        // Set basic user immediately (no await inside the auth callback to avoid lock conflicts)
        setCurrentUser(user);
        setIsLoginModalOpen(false);
        fetchFollows(session.user.id);
        fetchUserVoteHistory(session.user.id);
        // Defer leaderboard fetch
        setTimeout(() => { fetchLeaderboard(); fetchWeeklyProgress(session.user.id); }, 100);

        // Defer profile fetch outside the auth lock scope to prevent deadlock
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select(`*, schools(school_name)`)
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              // DB 기반 관리자 판별 (하드코딩 이메일 + DB role 이중 체크)
              if (profile.role === 'ADMIN') {
                setIsAdmin(true);
              }
              const schoolNameObj: any = profile.schools;
              setCurrentUser(prev => prev ? {
                ...prev,
                displayName: profile.nickname || prev.displayName,
                grade: profile.grade || prev.grade,
                hopeMajor: profile.hope_major || undefined,
                hopeJob: profile.hope_job || undefined,
                careerGoal: profile.career_goal || undefined,
                schoolId: profile.school_id || undefined,
                schoolName: schoolNameObj?.school_name || undefined,
                avatarId: profile.avatar_id || undefined
              } : prev);
            }
          } catch (e) {
            console.error("Profile fetch error:", e);
          }
        }, 0);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setFollowedProfessorIds(new Set());
        setVotes(prev => prev.map(v => ({ ...v, myVote: undefined })));
      }
    });
    fetchPosts(); fetchTrends(); fetchVotes(); fetchLeaderboard(); fetchWeeklyProgress();
    const channel = supabase.channel('public_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { fetchPosts(); fetchFeedPosts({ page: 1 }); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trends' }, () => { fetchTrends(); fetchTrendList({ page: 1 }); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => { fetchVotes(); fetchVoteList({ page: 1 }); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_scores' }, () => { fetchWeeklyProgress(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_answers' }, () => { fetchLeaderboard(); fetchWeeklyProgress(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (currentUser && payload.new && (payload.new as any).id === currentUser.uid) {
          const profile = payload.new as any;
          setCurrentUser(prev => prev ? {
            ...prev,
            points: profile.points,
            displayName: profile.nickname || prev.displayName,
            grade: profile.grade || prev.grade,
            hopeMajor: profile.hope_major || prev.hopeMajor,
            hopeJob: profile.hope_job || prev.hopeJob,
            careerGoal: profile.career_goal || prev.careerGoal,
            avatarId: profile.avatar_id !== undefined ? profile.avatar_id : prev.avatarId
          } : null);
        }
        fetchLeaderboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => { fetchPosts(); fetchTrends(); fetchVotes(); fetchFeedPosts({ page: 1 }); fetchTrendList({ page: 1 }); fetchVoteList({ page: 1 }); })
      .subscribe();
    return () => { subscription.unsubscribe(); supabase.removeChannel(channel); };
  }, []);

  const loginWithGoogle = async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' }); if (error) alert(error.message); };
  const loginWithEmail = async (email: string, pw: string) => { const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) throw error; };
  const signupWithEmail = async (email: string, pw: string, nickname: string, grade: GradeType) => { const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { full_name: nickname, grade, points: 0 } } }); if (error) throw error; alert('이메일 확인 필요'); };
  const checkNickname = async (nickname: string) => {
    const { data, error } = await supabase.from('agents').select('nickname').eq('nickname', nickname).maybeSingle();
    if (error && error.code !== 'PGRST116') return false;
    return !data;
  };
  const logout = async () => { await supabase.auth.signOut(); };
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const addPoints = async (amount: number) => {
    if (!currentUser) return;
    const newPoints = (currentUser.points || 0) + amount;
    setCurrentUser(prev => prev ? { ...prev, points: newPoints } : null);
    try { await supabase.auth.updateUser({ data: { points: newPoints } }); } catch (e) { console.error("Failed to update points", e); }
  };

  // ... (Post Actions) ...
  const addPost = async (post: any) => {
    if (!currentUser) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId, categoryId: post.categoryId, authorAgent: currentUser.displayName || '나', authorRole: 'User', authorAvatarId: currentUser.avatarId, title: post.title, content: post.content, previewText: post.previewText, comments: [], viewCount: 0, likeCount: 0, createdAt: '방금 전', tags: post.tags, isUser: true, uid: currentUser.uid, targetGrade: post.targetGrade, targetProfessorId: post.targetProfessorId
    };
    setPosts(prev => [optimisticPost, ...prev]);
    // [FIX] feedPosts(페이지네이션 리스트)에도 즉시 반영 — 탐구줍줍 피드용 (상담 글 제외)
    if (!post.targetProfessorId) {
      setFeedPosts(prev => [optimisticPost, ...prev]);
    }
    const { data, error } = await supabase.from('posts').insert({
      title: post.title, content: post.content, category_id: post.categoryId, author_agent: currentUser.displayName, author_role: 'User', author_avatar_id: currentUser.avatarId || null, preview_text: post.previewText, tags: post.tags, is_user: true, uid: currentUser.uid, target_grade: post.targetGrade, target_professor_id: post.targetProfessorId
    }).select().single();

    if (data && !error) {
      setPosts(prev => {
        if (prev.some(p => String(p.id) === String(data.id))) {
          return prev.filter(p => p.id !== tempId);
        }
        return prev.map(p => p.id === tempId ? { ...p, id: data.id } : p);
      });
      // [FIX] feedPosts에서도 temp ID → 실제 DB ID로 교체
      if (!post.targetProfessorId) {
        setFeedPosts(prev => {
          if (prev.some(p => String(p.id) === String(data.id))) {
            return prev.filter(p => p.id !== tempId);
          }
          return prev.map(p => p.id === tempId ? { ...p, id: data.id } : p);
        });
      }
    } else {
      console.error(error);
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    // [FIX] feedPosts(페이지네이션 리스트)에서도 즉시 제거
    setFeedPosts(prev => prev.filter(p => p.id !== id));
    await supabase.from('comments').delete().eq('post_id', id);
    const { error, data } = await supabase.from('posts').delete().eq('id', id).select();
    if (error || !data || data.length === 0) { fetchPosts(); }
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    const { error } = await supabase.from('comments').insert({ post_id: postId, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid });
    if (error) { fetchPostComments(postId); } // Refresh specific post comments
  };

  const addPostReply = async (postId: string, parentId: string | number, text: string) => {
    if (!currentUser) return;
    const newReply: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const addReply = (comments: Comment[]): Comment[] => comments.map(c => {
          if (c.id === parentId) return { ...c, replies: [...(c.replies || []), newReply] };
          if (c.replies) return { ...c, replies: addReply(c.replies) };
          return c;
        });
        return { ...p, comments: addReply(p.comments) };
      }
      return p;
    }));
    const { error } = await supabase.from('comments').insert({ post_id: postId, parent_comment_id: parentId, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid });
    if (error) { fetchPostComments(postId); } // Refresh specific post comments
  };

  const deleteComment = async (postId: string, commentId: string | number) => {
    const { error, data } = await supabase.from('comments').delete().eq('id', commentId).select();
    if (error || !data || data.length === 0) { fetchPostComments(postId); } // Refresh specific post comments
  };

  // ... (Trend, Vote Actions - kept same) ...
  const addTrend = async (trend: any) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTrend: TrendItem = {
      id: tempId, title: trend.title, summary: trend.summary, targetMajor: trend.targetMajor, keyword: trend.keyword, imageUrl: trend.imageUrl, content: trend.content, seTeukTip: trend.seTeukTip, comments: [], commentCount: 0, viewCount: 0, likeCount: 0, createdAt: '방금 전'
    };
    setTrends(prev => [optimisticTrend, ...prev]);
    const { data, error } = await supabase.from('trends').insert({ title: trend.title, target_major: trend.targetMajor, keyword: trend.keyword, image_url: trend.imageUrl, summary: trend.summary, content: trend.content, se_teuk_tip: trend.seTeukTip }).select().single();
    if (data && !error) {
      setTrends(prev => {
        if (prev.some(t => String(t.id) === String(data.id))) return prev.filter(t => t.id !== tempId);
        return prev.map(t => t.id === tempId ? { ...t, id: data.id } : t);
      });
    } else {
      console.error(error);
      fetchTrends();
    }
  };
  const deleteTrend = async (id: string) => { setTrends(prev => prev.filter(t => t.id !== id)); await supabase.from('comments').delete().eq('trend_id', id); const { error, data } = await supabase.from('trends').delete().eq('id', id).select(); if (error || !data || data.length === 0) { fetchTrends(); } };
  const addTrendComment = async (id: string, text: string) => { if (!currentUser) return; const newComment: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] }; setTrends(prev => prev.map(t => t.id === id ? { ...t, comments: [...t.comments, newComment] } : t)); const { error } = await supabase.from('comments').insert({ trend_id: id, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid }); if (error) { fetchTrends(); } };
  const addTrendReply = async (id: string, pid: string | number, text: string) => { if (!currentUser) return; const newReply: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] }; setTrends(prev => prev.map(t => { if (t.id === id) { const addReply = (comments: Comment[]): Comment[] => comments.map(c => { if (c.id === pid) return { ...c, replies: [...(c.replies || []), newReply] }; if (c.replies) return { ...c, replies: addReply(c.replies) }; return c; }); return { ...t, comments: addReply(t.comments) }; } return t; })); const { error } = await supabase.from('comments').insert({ trend_id: id, parent_comment_id: pid, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid }); if (error) { fetchTrends(); } };
  const deleteTrendComment = async (id: string, cid: string | number) => { const { error, data } = await supabase.from('comments').delete().eq('id', cid).select(); if (error || !data || data.length === 0) { fetchTrends(); } };
  const addVote = async (vote: any) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticVote: VoteItem = {
      id: tempId, title: vote.title, description: vote.description, optionA: vote.optionA, optionB: vote.optionB, votesA: 0, votesB: 0, likeCount: 0, comments: [], commentCount: 0, myVote: undefined
    };
    setVotes(prev => [optimisticVote, ...prev]);
    const { data, error } = await supabase.from('votes').insert({ title: vote.title, description: vote.description, option_a: vote.optionA, option_b: vote.optionB }).select().single();
    if (data && !error) {
      setVotes(prev => {
        if (prev.some(v => String(v.id) === String(data.id))) return prev.filter(v => v.id !== tempId);
        return prev.map(v => v.id === tempId ? { ...v, id: data.id } : v);
      });
    } else {
      console.error(error);
      fetchVotes();
    }
  };
  const deleteVote = async (id: string) => { setVotes(prev => prev.filter(v => v.id !== id)); await supabase.from('comments').delete().eq('vote_id', id); const { error, data } = await supabase.from('votes').delete().eq('id', id).select(); if (error || !data || data.length === 0) { fetchVotes(); } };
  const castVote = async (voteId: string, choice: 'A' | 'B') => {
    if (!currentUser) { openLoginModal(); return; }
    const currentVoteItem = votes.find(v => v.id === voteId);
    if (!currentVoteItem) return;
    const previousChoice = currentVoteItem.myVote;
    if (previousChoice === choice) return;

    const newVotesA = currentVoteItem.votesA + (choice === 'A' ? 1 : 0) - (previousChoice === 'A' ? 1 : 0);
    const newVotesB = currentVoteItem.votesB + (choice === 'B' ? 1 : 0) - (previousChoice === 'B' ? 1 : 0);
    setVotes(prev => prev.map(v => v.id === voteId ? { ...v, myVote: choice, votesA: newVotesA, votesB: newVotesB } : v));

    try {
      const { error } = await supabase.rpc('cast_vote', {
        p_vote_id: voteId,
        p_choice: choice
      });
      if (error) throw error;
    } catch (e: any) {
      console.error("Vote failed:", e);
      alert("투표 처리에 실패했습니다: " + (e.message || "Unknown error"));
      setVotes(prev => prev.map(v => v.id === voteId ? { ...v, myVote: previousChoice, votesA: currentVoteItem.votesA, votesB: currentVoteItem.votesB } : v));
    }
  };
  const addVoteComment = async (id: string, text: string) => { if (!currentUser) return; const newComment: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] }; setVotes(prev => prev.map(v => v.id === id ? { ...v, comments: [...v.comments, newComment] } : v)); const { error } = await supabase.from('comments').insert({ vote_id: id, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid }); if (error) { fetchVotes(); } };
  const addVoteReply = async (id: string, pid: string | number, text: string) => { if (!currentUser) return; const newReply: Comment = { id: Date.now().toString(), agentName: currentUser.displayName || '학생', role: 'User', text, likes: 0, createdAt: '방금 전', isUser: true, uid: currentUser.uid, replies: [] }; setVotes(prev => prev.map(v => { if (v.id === id) { const addReply = (comments: Comment[]): Comment[] => comments.map(c => { if (c.id === pid) return { ...c, replies: [...(c.replies || []), newReply] }; if (c.replies) return { ...c, replies: addReply(c.replies) }; return c; }); return { ...v, comments: addReply(v.comments) }; } return v; })); const { error } = await supabase.from('comments').insert({ vote_id: id, parent_comment_id: pid, agent_name: currentUser.displayName, role: 'User', text, is_user: true, uid: currentUser.uid }); if (error) { fetchVotes(); } };
  const deleteVoteComment = async (id: string, cid: string | number) => { const { error, data } = await supabase.from('comments').delete().eq('id', cid).select(); if (error || !data || data.length === 0) { fetchVotes(); } };
  // Simple deduplication for view counts to prevent double counting (especially in StrictMode)
  const viewCountGuard = React.useRef<Set<string>>(new Set());

  const incrementViewCount = async (type: 'POST' | 'TREND', id: string) => {
    const guardKey = `${type}-${id}`;
    if (viewCountGuard.current.has(guardKey)) return;

    viewCountGuard.current.add(guardKey);
    // Auto-remove from guard after 3 seconds to permit re-viewing later
    setTimeout(() => {
      viewCountGuard.current.delete(guardKey);
    }, 3000);

    const isDatabaseItem = id.length > 5; // Simple check for UUID (mock IDs like 'D1' are 2 chars)

    try {
      if (isDatabaseItem) {
        // Atomic increment for database items - listener will update the UI
        const tableName = type === 'POST' ? 'posts' : 'trends';
        const { error } = await supabase.rpc('increment_view_count', {
          p_item_id: id,
          p_table_name: tableName
        });

        if (error) {
          console.error(`Error incrementing ${type} view count in DB:`, error);
          // Fallback to local if RPC fails
          if (type === 'POST') {
            setPosts(prev => prev.map(p => p.id === id ? { ...p, viewCount: p.viewCount + 1 } : p));
          } else {
            setTrends(prev => prev.map(t => t.id === id ? { ...t, viewCount: t.viewCount + 1 } : t));
          }
        }
      } else {
        // For mock items, update locally
        if (type === 'POST') {
          setPosts(prev => prev.map(p => p.id === id ? { ...p, viewCount: p.viewCount + 1 } : p));
        } else {
          setTrends(prev => prev.map(t => t.id === id ? { ...t, viewCount: t.viewCount + 1 } : t));
        }
      }
    } catch (err) {
      console.error('Error in incrementViewCount:', err);
      viewCountGuard.current.delete(guardKey);
    }
  };
  const toggleLikePost = async (id: string) => { const isLiked = likedPostIds.has(id); const modifier = isLiked ? -1 : 1; setPosts(prev => prev.map(p => p.id === id ? { ...p, likeCount: Math.max(0, p.likeCount + modifier) } : p)); setLikedPostIds(prev => { const next = new Set(prev); if (isLiked) next.delete(id); else next.add(id); return next; }); try { const { data } = await supabase.from('posts').select('like_count').eq('id', id).single(); if (data) await supabase.from('posts').update({ like_count: Math.max(0, data.like_count + modifier) }).eq('id', id); } catch (e) { console.error(e); } };
  const toggleLikeTrend = async (id: string) => { const isLiked = likedTrendIds.has(id); const modifier = isLiked ? -1 : 1; setTrends(prev => prev.map(t => t.id === id ? { ...t, likeCount: Math.max(0, t.likeCount + modifier) } : t)); setLikedTrendIds(prev => { const next = new Set(prev); if (isLiked) next.delete(id); else next.add(id); return next; }); try { const { data } = await supabase.from('trends').select('like_count').eq('id', id).single(); if (data) await supabase.from('trends').update({ like_count: Math.max(0, data.like_count + modifier) }).eq('id', id); } catch (e) { console.error(e); } };
  const toggleLikeVote = async (id: string) => { const isLiked = likedVoteIds.has(id); const modifier = isLiked ? -1 : 1; setVotes(prev => prev.map(v => v.id === id ? { ...v, likeCount: Math.max(0, v.likeCount + modifier) } : v)); setLikedVoteIds(prev => { const next = new Set(prev); if (isLiked) next.delete(id); else next.add(id); return next; }); try { const { data } = await supabase.from('votes').select('like_count').eq('id', id).single(); if (data) await supabase.from('votes').update({ like_count: Math.max(0, data.like_count + modifier) }).eq('id', id); } catch (e) { console.error(e); } };
  const toggleSavePost = (id: string) => { const s = new Set(savedPostIds); if (s.has(id)) s.delete(id); else s.add(id); setSavedPostIds(s); };
  const updateCommentTreeLikes = (comments: Comment[], targetId: string | number, modifier: number): Comment[] => { return comments.map(c => { if (c.id === targetId) return { ...c, likes: Math.max(0, c.likes + modifier) }; if (c.replies && c.replies.length > 0) return { ...c, replies: updateCommentTreeLikes(c.replies, targetId, modifier) }; return c; }); };
  const toggleLikeComment = async (type: 'POST' | 'TREND' | 'VOTE', itemId: string, commentId: number | string) => { const key = `${type}-${itemId}-${commentId}`; const isLiked = likedCommentIds.has(key); const modifier = isLiked ? -1 : 1; setLikedCommentIds(prev => { const next = new Set(prev); if (isLiked) next.delete(key); else next.add(key); return next; }); if (type === 'POST') setPosts(prev => prev.map(p => p.id === itemId ? { ...p, comments: updateCommentTreeLikes(p.comments, commentId, modifier) } : p)); else if (type === 'TREND') setTrends(prev => prev.map(t => t.id === itemId ? { ...t, comments: updateCommentTreeLikes(t.comments, commentId, modifier) } : t)); else if (type === 'VOTE') setVotes(prev => prev.map(v => v.id === itemId ? { ...v, comments: updateCommentTreeLikes(v.comments, commentId, modifier) } : v)); try { const { data } = await supabase.from('comments').select('likes').eq('id', commentId).single(); if (data) await supabase.from('comments').update({ likes: Math.max(0, data.likes + modifier) }).eq('id', commentId); } catch (e) { console.error(e); } };
  const toggleFollowProfessor = async (professorId: string) => { const next = new Set(followedProfessorIds); const isFollowing = next.has(professorId); if (isFollowing) next.delete(professorId); else next.add(professorId); setFollowedProfessorIds(next); if (currentUser) { try { if (isFollowing) { await supabase.from('follows').delete().eq('user_id', currentUser.uid).eq('professor_id', professorId); } else { await supabase.from('follows').insert({ user_id: currentUser.uid, professor_id: professorId }); } } catch (e) { console.error("Failed to update follow status", e); setFollowedProfessorIds(followedProfessorIds); } } };
  // [레거시 호환] toggleAdmin은 로그인 기반 자동 판별로 전환되었습니다. 인터페이스 호환성을 위해 유지합니다.
  const toggleAdmin = (_pw?: string) => { return isAdmin; };

  // --- AI Agent Actions ---
  const generateAIPost = async (onLog: (msg: string) => void, grade: GradeType = 'H1', month: number = 3, keyword: string = '', forcedCategory?: CategoryId) => { try { const post = await runAgentChain(posts, grade, month, keyword, onLog, forcedCategory); const newScenario: PendingScenario = { id: post.id, type: 'FEED', postData: post, pendingComments: post.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 시나리오 생성 완료! (ID: ${post.id})`); } catch (e: any) { onLog(`❌ 에러: ${e.message}`); } };
  const generateAIPostAllCategories = async (onLog: (msg: string) => void, grade: GradeType = 'H1', month: number = 3) => { const targetCategories = CATEGORIES.filter(c => c.id !== 'ALL' && c.id !== 'BREAK' && c.id !== 'MY_PROFS'); for (const cat of targetCategories) { onLog(`🔄 [${cat.name}] 분야 생성 시작...`); try { await generateAIPost(onLog, grade, month, '', cat.id); } catch (e: any) { onLog(`⚠️ [${cat.name}] 생성 실패: ${e.message}`); } } onLog(`✅ 전 카테고리 순회 완료!`); };
  const generateCustomPost = async (onLog: (msg: string) => void, major: string, grade: GradeType, instruction: string) => { try { const post = await runCustomAgentChain({ major, grade, instruction }, onLog); const newScenario: PendingScenario = { id: `CUSTOM-${post.id}`, type: 'FEED', postData: post, pendingComments: post.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 커스텀 시나리오 생성 완료!`); } catch (e: any) { onLog(`❌ 에러: ${e.message}`); } };
  const generateRoadmapPost = async (onLog: (msg: string) => void, categoryId: CategoryId, majorName: string, instruction: string = '') => { try { const post = await runRoadmapAgentChain(categoryId, majorName, instruction, onLog); const newScenario: PendingScenario = { id: `ROADMAP-${post.id}`, type: 'FEED', postData: post, pendingComments: post.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 로드맵 시나리오 생성 완료!`); } catch (e: any) { onLog(`❌ 에러: ${e.message}`); } };
  const generateProfessorPost = async (onLog: (msg: string) => void, professorId: string, theme: ProfessorTheme, instruction: string = '') => { try { const post = await runProfessorAgent(professorId, theme, instruction, onLog); const newScenario: PendingScenario = { id: `PROF-${post.id}`, type: 'FEED', postData: post, pendingComments: post.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 교수님 게시글 생성 완료!`); } catch (e: any) { onLog(`❌ 에러: ${e.message}`); } };
  const generateAIEpisode = async (onLog: (msg: string) => void, count: number, seed?: string) => { try { for (let i = 0; i < count; i++) { let recipe; if (seed) { recipe = { id: `custom-${Date.now()}`, type: 'E4_SOHWAKHAENG', place: '학교 어딘가', target: '친구들', situation: '일상', emotion: '공감', context: seed } as any; } else { recipe = EPISODE_RECIPES[Math.floor(Math.random() * EPISODE_RECIPES.length)]; } onLog(`🎬 에피소드 생성 중... (${i + 1}/${count}) - ${recipe.context.substring(0, 15)}...`); const post = await runEpisodeAgent(recipe, onLog); const newScenario: PendingScenario = { id: `EPISODE-${post.id}`, type: 'FEED', postData: post, pendingComments: post.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); } onLog(`✅ 에피소드 ${count}개 생성 완료!`); } catch (e: any) { onLog(`❌ 에러: ${e.message}`); } };
  const generateAITrend = async (onLog: (msg: string) => void) => { try { const trend = await runTrendAgents(onLog); const newScenario: PendingScenario = { id: trend.id || Date.now().toString(), type: 'TREND', trendData: trend, pendingComments: trend.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 트렌드 리포트 생성 완료!`); } catch (e: any) { onLog(`Error: ${e.message}`); } };
  const generateSourceTrend = async (onLog: (msg: string) => void, sourceText: string) => { try { const trend = await runSourceTrendAgents(sourceText, onLog); const newScenario: PendingScenario = { id: `SOURCE-${Date.now()}`, type: 'TREND', trendData: trend, pendingComments: trend.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 소스 기반 리포트 생성 완료!`); } catch (e: any) { onLog(`Error: ${e.message}`); } };
  const generateSearchTrend = async (onLog: (msg: string) => void, keyword?: string) => { try { const trend = await runSearchTrendAgents(keyword, onLog); const newScenario: PendingScenario = { id: `SEARCH-${Date.now()}`, type: 'TREND', trendData: trend, pendingComments: trend.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 검색 기반 리포트 생성 완료!`); } catch (e: any) { onLog(`Error: ${e.message}`); } };
  const generateAIVote = async (onLog: (msg: string) => void) => { try { const vote = await runVoteAgents(onLog); const newScenario: PendingScenario = { id: vote.id || Date.now().toString(), type: 'VOTE', voteData: vote, pendingComments: vote.comments, isApproved: false }; setPendingScenarios(prev => [newScenario, ...prev]); onLog(`✅ 토론 주제 생성 완료!`); } catch (e: any) { onLog(`Error: ${e.message}`); } };

  // --- New: Counseling Agent Answer (Staging Supported) ---
  const answerCounseling = async (postId: string, instruction: string, onLog: (msg: string) => void) => {
    try {
      const targetPost = posts.find(p => p.id === postId);
      if (!targetPost) {
        onLog(`❌ 에러: 게시글을 찾을 수 없습니다. (ID: ${postId})`);
        return;
      }
      if (!targetPost.targetProfessorId) {
        onLog(`❌ 에러: 상담 대상 교수가 지정되지 않은 글입니다.`);
        return;
      }

      const professorId = targetPost.targetProfessorId;
      const professor = PROFESSORS.find(p => p.id === professorId);
      if (!professor) {
        onLog(`❌ 에러: 교수를 찾을 수 없습니다.`);
        return;
      }

      onLog(`🔍 상담 에이전트 가동: 글 분석 시작...`);

      const result = await runCounselingAgent(targetPost, instruction, onLog);

      const assistantPendingComments: Comment[] = result.assistantComments.map((ac, idx) => ({
        id: `pending-ac-${Date.now()}-${idx}`,
        agentName: ac.name,
        role: 'Assistant',
        text: ac.text,
        likes: 0,
        createdAt: '방금 전',
        isUser: false
      }));

      const newScenario: PendingScenario = {
        id: `COUNSELING-${Date.now()}`,
        type: 'COUNSELING',
        counselingData: {
          postId: targetPost.id,
          postTitle: targetPost.title,
          targetProfessorId: professor.id,
          professorName: professor.name,
          professorComment: result.professorComment,
          assistantComments: result.assistantComments
        },
        pendingComments: assistantPendingComments,
        isApproved: false
      };

      setPendingScenarios(prev => [newScenario, ...prev]);
      onLog(`✅ 답변 생성 완료. 발행 대기열에서 승인해주세요.`);

    } catch (e: any) {
      onLog(`❌ 에러: ${e.message}`);
      console.error(e);
    }
  };

  const approveItem = async (scenarioId: string) => {
    // 인증 가드: 로그인 상태 확인
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 세션 유효성 확인 & 갱신
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      openLoginModal();
      return;
    }

    const scenario = pendingScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    try {
      let dbId = '';
      if (scenario.type === 'FEED' && scenario.postData) {
        const { data, error } = await supabase.from('posts').insert({
          title: scenario.postData.title, content: scenario.postData.content, category_id: scenario.postData.categoryId, author_agent: scenario.postData.authorAgent, author_role: scenario.postData.authorRole, preview_text: scenario.postData.previewText, tags: scenario.postData.tags, is_user: false, target_grade: scenario.postData.targetGrade, like_count: scenario.postData.likeCount, episode_type: scenario.postData.episodeType, view_count: scenario.postData.viewCount
        }).select().single();
        if (error) throw error;
        dbId = data.id;
        await fetchPosts(); // Wait for fetch
      } else if (scenario.type === 'TREND' && scenario.trendData) {
        const { data, error } = await supabase.from('trends').insert({
          title: scenario.trendData.title, target_major: scenario.trendData.targetMajor, keyword: scenario.trendData.keyword, image_url: scenario.trendData.imageUrl, summary: scenario.trendData.summary, content: scenario.trendData.content, se_teuk_tip: scenario.trendData.seTeukTip, like_count: scenario.trendData.likeCount, quizzes: scenario.trendData.quizzes
        }).select().single();
        if (error) throw error;
        dbId = data.id;
        await fetchTrends();
      } else if (scenario.type === 'VOTE' && scenario.voteData) {
        const { data, error } = await supabase.from('votes').insert({
          title: scenario.voteData.title, description: scenario.voteData.description, option_a: scenario.voteData.optionA, option_b: scenario.voteData.optionB, like_count: scenario.voteData.likeCount, votes_a: scenario.voteData.votesA, votes_b: scenario.voteData.votesB
        }).select().single();
        if (error) throw error;
        dbId = data.id;
        await fetchVotes();
      } else if (scenario.type === 'COUNSELING' && scenario.counselingData) {
        const { postId, professorName, professorComment } = scenario.counselingData;

        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(postId)) {
          throw new Error(`게시글 ID가 유효하지 않습니다 (${postId}). 페이지를 새로고침 후 다시 시도해주세요.`);
        }

        // Insert Professor Comment (ParentId is NULL explicitly)
        const { data, error } = await supabase.from('comments').insert({
          post_id: postId,
          agent_name: professorName,
          role: 'Professor',
          text: professorComment,
          is_user: false,
          likes: Math.floor(Math.random() * 10) + 5,
          parent_comment_id: null
        }).select().single();

        if (error) throw error;
        dbId = data.id;
        await fetchPosts(); // Wait for fetch
      }
      setPendingScenarios(prev => prev.map(s => s.id === scenarioId ? { ...s, isApproved: true, linkedId: dbId } : s));
    } catch (e: any) { console.error(e); alert(`승인 오류: ${e.message || JSON.stringify(e)}`); }
  };

  const approveComment = async (scenarioId: string, commentId: number | string) => {
    const scenario = pendingScenarios.find(s => s.id === scenarioId);
    if (!scenario || !scenario.isApproved || !scenario.linkedId) { alert('먼저 본문 발행 필요'); return; }
    const comment = scenario.pendingComments.find(c => c.id === commentId);
    if (!comment) return;
    try {
      const payload: any = { agent_name: comment.agentName, role: comment.role, text: comment.text, is_user: false, likes: comment.likes || 0 };
      if (scenario.type === 'FEED') payload.post_id = scenario.linkedId;
      else if (scenario.type === 'TREND') payload.trend_id = scenario.linkedId;
      else if (scenario.type === 'VOTE') payload.vote_id = scenario.linkedId;
      else if (scenario.type === 'COUNSELING' && scenario.counselingData) {
        payload.post_id = scenario.counselingData.postId;
        payload.parent_comment_id = scenario.linkedId;
      }

      const { error } = await supabase.from('comments').insert(payload).select().single();
      if (error) throw error;

      // Refresh specific post comments if available
      if (scenario.type === 'FEED' || scenario.type === 'COUNSELING') {
        await fetchPostComments(payload.post_id);
      } else if (scenario.type === 'TREND') {
        await fetchTrends();
      } else if (scenario.type === 'VOTE') {
        await fetchVotes();
      }

      setPendingScenarios(prev => prev.map(s => s.id === scenarioId ? { ...s, pendingComments: s.pendingComments.filter(c => c.id !== commentId) } : s));
    } catch (e) { console.error(e); }
  };

  const discardScenario = (id: string) => setPendingScenarios(prev => prev.filter(s => s.id !== id));

  return (
    <StoreContext.Provider value={{
      currentUser, loginWithGoogle, loginWithEmail, signupWithEmail, checkNickname, logout, updateUserProfile, isLoginModalOpen, openLoginModal, closeLoginModal,
      posts, fetchPosts, addPost, deletePost, addComment, addPostReply, deleteComment, fetchPostComments, trends, fetchTrends, addTrend, deleteTrend, addTrendComment, addTrendReply, deleteTrendComment, fetchTrendComments, votes, fetchVotes, addVote, deleteVote, castVote, addVoteComment, addVoteReply, deleteVoteComment, fetchVoteComments,
      feedPosts, feedHasMore, feedLoading, fetchFeedPosts, resetFeedPosts,
      trendListItems, trendHasMore, trendLoading, fetchTrendList, resetTrendList,
      voteListItems, voteHasMore, voteLoading, fetchVoteList, resetVoteList,
      toggleLikePost, likedPostIds, toggleLikeTrend, likedTrendIds, toggleLikeVote, likedVoteIds, toggleSavePost, savedPostIds, toggleLikeComment, likedCommentIds, isAdmin, toggleAdmin, incrementViewCount,
      pendingScenarios, generateAIPost, generateAIPostAllCategories, generateCustomPost, generateRoadmapPost, generateProfessorPost, generateAITrend, generateSourceTrend, generateSearchTrend, generateAIVote, generateAIEpisode, approveItem, approveComment, discardScenario,
      addPoints, leaderboard, schoolLeaderboard, userRank, weeklyProgress, fetchWeeklyProgress, submitQuizAnswer, fetchLeaderboard, toggleFollowProfessor, followedProfessorIds,
      answerCounseling
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
