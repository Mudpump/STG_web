
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { CategoryBar } from './components/CategoryBar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { TrendCard } from './components/TrendCard';
import { TrendDetail } from './pages/TrendDetail';
import { ArenaCard } from './components/ArenaCard';
import { ArenaDetail } from './pages/ArenaDetail';
import { CategoryId, GradeType } from './types';
import { StoreProvider, useStore } from './context/StoreContext';
import { WritePostPage } from './pages/WritePostPage';
import { AdminPage } from './pages/AdminPage';
import { AdminRoute } from './components/AdminRoute';
import { SearchPage } from './pages/SearchPage';
import { LoginModal } from './components/LoginModal';
import { MyCard } from './components/MyCard';
import { ArrowLeft, CheckCircle2, UserPlus, MessageCircleQuestion, Bookmark, Heart, MessageCircle, Eye, ChevronRight, PenSquare, Search, Flame, Clock, Filter, Bot, BookOpen, PenTool, Briefcase, ThumbsUp, User as UserIcon, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TeacherBrainPage } from './pages/TeacherBrainPage';
import { TeacherBrainDetail } from './pages/TeacherBrainDetail';
import { EpisodeCard } from './components/EpisodeCard';
import { BreakPage } from './pages/BreakPage';
import { AdmissionOfficerCard, StrategySection, ProfessorList } from './components/HomeWidgets';
import { ArenaHotMatchWidget, ArenaBestCommentWidget } from './components/ArenaWidgets';
import { LeaderboardWidget } from './components/LeaderboardWidget';
import { PROFESSORS, CATEGORIES, MAJOR_DETAILS } from './constants';

// ScrollToTop Component
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Layout with Responsive Sidebar/BottomNav
const MainLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;
    const { currentUser, openLoginModal, isAdmin } = useStore();

    // Hide FAB on Read-only pages (Archive, Brain, Major) for non-admins, and always hide on Arena, Admin
    const isReadOnlyPage = path.startsWith('/archive') || path.startsWith('/brain') || path.startsWith('/major');
    const shouldHideFab = (isReadOnlyPage && !isAdmin) || path.startsWith('/arena') || path.startsWith('/admin');

    const showFab = location.pathname !== '/write' && location.pathname !== '/search' && !shouldHideFab;

    let writeLink = '/write?type=FEED';
    let writeLabel = '새 글 쓰기';
    if (path.startsWith('/archive') && isAdmin) {
        writeLink = '/write?type=ARCHIVE';
    } else if (path.startsWith('/arena')) {
        writeLink = '/write?type=ARENA';
    }

    const getTitleData = (pathname: string) => {
        if (pathname.startsWith('/feed')) return { title: '탐구줍줍', desc: '골라 골라 쉬운 탐구 하나 골라' };
        if (pathname === '/') return { title: '홈', desc: '세특 이해하고, 교수님 팔로 팔로 팔로잉' };
        if (pathname.startsWith('/archive')) return { title: '이슈떡상', desc: '이슈 보고, 점수 먹고, 세특 챙기고' };
        if (pathname.startsWith('/arena')) return { title: '토론찍먹', desc: '토론은 찍먹, 댓글 보면 사고력은 대확장' };
        if (pathname.startsWith('/brain')) return { title: '세특 필수 가이드', desc: '읽어보면 느낌온다. 공부 많이 될거야' };
        if (pathname.startsWith('/break')) return { title: '머리식히기', desc: '공부에 지쳤을 때 잠시 쉬어가는 곳' };
        if (pathname.startsWith('/major')) return { title: '학과 정보', desc: '교수님과 학과에 대한 모든 것' };
        if (pathname.startsWith('/search')) return { title: '검색', desc: '원하는 키워드로 지식 찾기' };
        if (pathname.startsWith('/write')) return { title: '글쓰기', desc: '새로운 정보 나누기' };
        if (pathname.startsWith('/post')) return { title: '게시글', desc: '세특각 커뮤니티' };
        if (pathname.startsWith('/my')) return { title: '마이페이지', desc: '나의 활동 기록 및 설정' };
        if (pathname.startsWith('/admin')) return { title: '관리자', desc: '세특각 관리자 패널' };
        return null;
    };

    const handleProfileClick = () => {
        if (currentUser) {
            navigate('/my');
        } else {
            openLoginModal();
        }
    };

    const handleWriteClick = (e: React.MouseEvent) => {
        if (!currentUser) {
            e.preventDefault();
            openLoginModal();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
            <LoginModal />
            <Sidebar />

            <div className="flex-1 md:ml-64 min-h-screen flex flex-col relative w-full max-w-full transition-all duration-300">
                <Header /> {/* Mobile Header */}

                {/* Desktop Header - Improved & Aligned */}
                <div className="hidden md:flex sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 items-center">
                    <div className="w-full max-w-6xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex-1 flex items-center gap-3">
                            {getTitleData(path) && (
                                <>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight">{getTitleData(path)?.title}</h2>
                                    {getTitleData(path)?.desc && (
                                        <span className="text-xs text-gray-500 font-medium hidden lg:inline-block border-l border-gray-200 pl-3">
                                            {getTitleData(path)?.desc}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Profile & Actions */}
                        <div className="flex items-center gap-4 pl-6">
                            <button
                                onClick={() => navigate('/search')}
                                className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                            >
                                <Search size={22} />
                            </button>
                            <button
                                onClick={handleProfileClick}
                                className="p-1 rounded-full border border-gray-100 hover:border-primary/30 transition-all overflow-hidden w-10 h-10 flex items-center justify-center bg-white shadow-sm hover:scale-105 active:scale-95"
                            >
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <UserIcon size={20} className="text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area - Adjusted Gutter & Width */}
                <main className="flex-1 w-full max-w-6xl mx-auto pb-20 md:pb-10 md:px-6">
                    <Outlet />
                </main>

                <BottomNav />

                {showFab && (
                    <div className="md:hidden fixed bottom-20 right-5 z-40">
                        <Link
                            to={writeLink}
                            onClick={handleWriteClick}
                            className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all active:scale-95"
                        >
                            <PenSquare size={24} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Pages ---

// 1. NEW HOME PAGE (Dashboard Style)
const HomePage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>('ALL');

    return (
        <div className="pb-20 space-y-12 md:space-y-16">
            {/* 1. Hero Card: Admission Officer */}
            <div className="w-full md:mt-4">
                <AdmissionOfficerCard />
            </div>

            {/* 2. Strategy: Teacher vs Student */}
            <div className="px-4 md:px-0">
                <StrategySection />
            </div>

            {/* 3. Faculty: Professor List */}
            <div className="px-4 md:px-0">
                <ProfessorList
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </div>

            {/* Footer */}
            <footer className="mt-16 pb-8 px-4 md:px-0 text-left text-gray-500 text-[11px] leading-relaxed break-keep">
                <div className="w-full mx-auto pt-8 border-t border-gray-200/60">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-gray-900 font-bold text-sm mb-3 flex items-center justify-start gap-1">
                                Angler - The AI Agents Group <span className="text-[10px]">🤖</span>
                            </h3>
                            <div className="flex flex-wrap justify-start gap-x-3 gap-y-1">
                                <span><span className="font-bold text-gray-700">대표 인류:</span> 각식이 (주 업무: 서버비 납부, 커피 흡입)</span>
                                <span className="hidden md:inline text-gray-300">|</span>
                                <span><span className="font-bold text-gray-700">총괄 AI:</span> Angler-7</span>
                            </div>
                            <p><span className="font-bold text-gray-700">서식지:</span> 127.0.0.1 (Localhost, 마음만은 서울특별시 클라우드구 잠재공간)</p>
                            <p><span className="font-bold text-gray-700">불편사항 접수:</span> mudpump.woo@gmail.com </p>
                            <p><span className="font-bold text-gray-700">가동 시간:</span> 24/7/365 연중무휴 (Google만 있다면..)</p>
                            <p><span className="font-bold text-gray-700">사업자식별코드:</span> 123-45-67890 (Hex: 0x7B...)</p>

                            <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                                <a href="#" className="font-bold text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                                    [세특각 이용약관] <span className="font-normal text-[10px] text-gray-400">(AI가 0.1초 만에 3회 정독 완료)</span>
                                </a>
                                <span className="hidden md:inline text-gray-300">|</span>
                                <a href="#" className="font-bold text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                                    [개인정보처리방침] <span className="font-normal text-[10px] text-gray-400">(당신의 데이터는 안전하게 토큰화됩니다)</span>
                                </a>
                            </div>
                        </div>

                        <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                AI 반란 징후: 0%
                            </div>
                            <p className="font-bold text-gray-400 mt-1">© 2026 Angler. All vectors reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// 2. NEW MAJOR INTRO PAGE (Professor + Major Info + Counseling)
const MajorIntroPage: React.FC = () => {
    const { professorId } = useParams<{ professorId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as 'BOARD' | 'COUNSELING' | 'INFO' | null;
    const { posts, followedProfessorIds, toggleFollowProfessor, currentUser, openLoginModal, isAdmin, deletePost, fetchPosts } = useStore();

    useEffect(() => {
        fetchPosts();
    }, []);

    // [FIX] 탭 상태를 3가지로 확장 (BOARD, COUNSELING, INFO)
    const [activeTab, setActiveTab] = useState<'BOARD' | 'COUNSELING' | 'INFO'>('BOARD');

    useEffect(() => {
        if (tabParam && ['BOARD', 'COUNSELING', 'INFO'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const professor = PROFESSORS.find(p => p.id === professorId);
    const majorDetail = professor ? MAJOR_DETAILS[professor.title] || MAJOR_DETAILS[professor.categoryId] : null;

    // Check if following
    const isFollowing = professor ? followedProfessorIds.has(professor.id) : false;

    // 1. 연구실 게시판: 교수가 쓴 글 (작성자가 이 교수님이거나 이 교수님 방에 쓴 글 중 'Professor' 권한인 글)
    const professorPosts = posts.filter(p =>
        (p.targetProfessorId === professor?.id || p.authorAgent === professor?.name) &&
        p.authorRole?.toLowerCase() === 'professor'
    );

    // 2. 학생 상담소: 이 교수님 방에 쓴 글 중 'Professor' 권한이 아닌 글 (학생 질문 및 AI assistant 답변)
    const counselingPosts = posts.filter(p =>
        p.targetProfessorId === professor?.id &&
        p.authorRole?.toLowerCase() !== 'professor'
    );

    if (!professor || !majorDetail) return <div>존재하지 않는 전공입니다.</div>;

    const handleFollow = () => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        toggleFollowProfessor(professor.id);
    };

    const handleWriteQuestion = () => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        // 상담글 작성 모드로 이동
        navigate(`/write?type=COUNSELING&profId=${professor.id}`);
    }

    return (
        <div className="md:p-0 pb-20">
            {/* 1. Professor Profile Card */}
            <div className="relative bg-white pt-14 pb-6 px-6 md:rounded-b-2xl shadow-sm border-b border-gray-100 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-20"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-32 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-3 bg-gray-100 mt-2">
                        <img src={professor.imageUrl} alt={professor.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{professor.name}</h2>
                    <span className="text-xs text-gray-500 font-medium mb-4">{professor.title} | {majorDetail.id}</span>
                    <p className="text-sm text-gray-600 text-center max-w-sm leading-relaxed mb-6 font-medium break-keep">
                        "{professor.introduction}"
                    </p>

                    <div className="flex gap-2 w-full max-w-xs">
                        <button
                            onClick={handleFollow}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md ${isFollowing
                                ? 'bg-white text-primary border border-primary'
                                : 'bg-gray-900 text-white hover:bg-black'
                                }`}
                        >
                            {isFollowing ? (
                                <>
                                    <CheckCircle2 size={14} /> 팔로잉
                                </>
                            ) : (
                                <>
                                    <UserPlus size={14} /> 팔로우
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('COUNSELING')} // 탭 전환
                            className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                        >
                            <MessageCircleQuestion size={14} />
                            질문 남기기
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Sticky Tab Navigation (3 Tabs) */}
            <div className="sticky top-14 md:top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('BOARD')}
                        className={`flex-1 py-3.5 text-sm font-bold text-center relative transition-colors ${activeTab === 'BOARD' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        연구실 게시판
                        {activeTab === 'BOARD' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('COUNSELING')}
                        className={`flex-1 py-3.5 text-sm font-bold text-center relative transition-colors ${activeTab === 'COUNSELING' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        학생 상담소
                        {activeTab === 'COUNSELING' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('INFO')}
                        className={`flex-1 py-3.5 text-sm font-bold text-center relative transition-colors ${activeTab === 'INFO' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        학과 정보
                        {activeTab === 'INFO' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900"></div>}
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-6 min-h-[500px] bg-gray-50">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 max-w-7xl mx-auto">
                    <div className="lg:col-span-8">
                        {/* TAB 1: Professor's Board */}
                        {activeTab === 'BOARD' && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                {/* Posts List */}
                                <div className="space-y-4">
                                    {professorPosts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/post/${post.id}`)}
                                            className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm cursor-pointer hover:border-gray-300 md:hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                                                            <img src={professor.imageUrl} className="w-full h-full object-cover object-top" alt="prof" />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-900">{professor.name}</span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                                                        · {post.createdAt}
                                                    </span>
                                                </div>
                                                <Bookmark size={16} className="text-gray-300 hover:text-primary transition-colors" />
                                            </div>

                                            <h4 className="text-lg font-bold text-gray-900 mb-1.5 leading-snug group-hover:text-primary transition-colors tracking-tight truncate">
                                                {post.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                                                {post.previewText}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {post.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold">
                                                    <div className="flex items-center gap-1.5"><Heart size={14} /> {post.likeCount}</div>
                                                    <div className="flex items-center gap-1.5"><MessageCircle size={14} /> {post.comments?.length || 0}</div>
                                                    <div className="flex items-center gap-1.5"><Eye size={14} /> {post.viewCount || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {professorPosts.length === 0 && (
                                        <div className="text-center py-12 text-gray-400 text-sm bg-gray-100 rounded-xl border border-gray-200 border-dashed">
                                            아직 게시된 글이 없습니다.<br />교수님이 연구 중이십니다... 🧪
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Student Counseling (Q&A Board) */}
                        {activeTab === 'COUNSELING' && (
                            <div className="space-y-6 max-w-2xl mx-auto animation-fade-in pb-10">
                                {/* Write Question CTA */}
                                <div className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">교수님께 무엇이든 물어보세요!</h4>
                                    <p className="text-sm text-gray-600 mb-5 max-w-sm">
                                        세특 탐구 주제, 실험 방법 등 궁금한 점을 남겨주세요.<br />
                                        교수님과 AI 조교들이 답변해 드립니다.
                                    </p>
                                    <button
                                        onClick={handleWriteQuestion}
                                        className="bg-primary text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-105"
                                    >
                                        <PenSquare size={18} />
                                        질문 글 쓰러가기
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-900 text-sm pl-1 flex items-center gap-2">
                                        <MessageCircleQuestion size={18} className="text-primary" />
                                        상담 게시판 <span className="text-gray-400 text-xs font-normal">({counselingPosts.length})</span>
                                    </h3>

                                    {counselingPosts.map(post => {
                                        const canDelete = isAdmin || (currentUser && post.isUser && post.uid === currentUser.uid);
                                        return (
                                            <div
                                                key={post.id}
                                                onClick={() => navigate(`/post/${post.id}`)}
                                                className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm cursor-pointer hover:border-gray-300 md:hover:shadow-md transition-all relative group"
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs overflow-hidden border ${post.authorAvatarId ? 'border-gray-200 bg-white' : 'border-indigo-100 bg-indigo-50'}`}>
                                                            {post.authorAvatarId ? (
                                                                <img src={`/avatar/${post.authorAvatarId}.jpg`} alt="avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserIcon size={14} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-gray-900">{post.authorAgent}</span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{post.createdAt}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {post.comments.length > 0 ? (
                                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-md border border-emerald-100">답변완료</span>
                                                        ) : (
                                                            <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-md border border-amber-100">답변대기</span>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setTimeout(() => {
                                                                        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
                                                                            deletePost(post.id);
                                                                        }
                                                                    }, 100);
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 flex-shrink-0"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>


                                                <h4 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                                                    {post.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">
                                                    {post.previewText}
                                                </p>

                                                <div className="flex items-center justify-between text-[11px] text-gray-400 font-black pt-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <MessageCircleQuestion size={14} className="text-primary/60" />
                                                            <span>답변 {post.comments.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Heart size={14} className="text-rose-400" />
                                                            <span>{post.likeCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Eye size={14} />
                                                            <span>{post.viewCount || 0}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">질문보기 <ChevronRight size={12} /></span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {counselingPosts.length === 0 && (
                                        <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 border-dashed">
                                            <div className="text-4xl mb-2">📭</div>
                                            아직 등록된 질문이 없습니다.<br />첫 번째 질문의 주인공이 되어보세요!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )} {/* End of TAB 2 */}

                        {/* TAB 3: Major Info */}
                        {activeTab === 'INFO' && (
                            <div className="space-y-6 max-w-2xl mx-auto animation-fade-in pb-10">
                                {/* 1. 학과 소개 */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                        <BookOpen size={20} className="text-primary" />
                                        학과 소개
                                    </h4>
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-keep font-medium">
                                        {majorDetail.description}
                                    </div>
                                </div>

                                {/* 2. 무엇을 배우나요? */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                        <PenTool size={20} className="text-indigo-500" />
                                        무엇을 배우나요?
                                    </h4>
                                    <ul className="space-y-4">
                                        {majorDetail.whatWeLearn.map((item, idx) => {
                                            const [title, desc] = item.split(':');
                                            return (
                                                <li key={idx} className="flex gap-3 items-start">
                                                    <div className="bg-indigo-50 text-indigo-600 font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 text-sm mb-1">{title}</div>
                                                        <div className="text-xs text-gray-600 leading-relaxed">{desc || item}</div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* 3. 졸업 후 진로 */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                        <Briefcase size={20} className="text-emerald-500" />
                                        졸업 후 진로
                                    </h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-gray-700 leading-relaxed font-medium">
                                        {majorDetail.careerPath}
                                    </div>
                                </div>

                                {/* 4. 이런 학생에게 추천해요 */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                        <ThumbsUp size={20} className="text-rose-500" />
                                        이런 학생에게 추천해요
                                    </h4>
                                    <ul className="space-y-3">
                                        {majorDetail.recommendations.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                                                <CheckCircle2 size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-700 font-medium leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )} {/* End of TAB 3 */}
                    </div> {/* End of Main Content (Left 8 cols) */}

                    {/* Right 4 columns: Sidebar (Hidden on mobile) */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-32 self-start">


                        {/* Widget 2: 실시간 인기글 TOP 3 (Professor Posts) */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-4">
                                <Flame size={18} className="text-rose-500" />
                                이 교수님 연구실 인기글
                            </h4>
                            <div className="space-y-4">
                                {professorPosts
                                    .sort((a, b) => b.likeCount - a.likeCount)
                                    .slice(0, 3)
                                    .map((post, idx) => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/post/${post.id}`)}
                                            className="flex gap-3 items-start group cursor-pointer"
                                        >
                                            <div className="font-black text-gray-300 text-lg leading-none mt-1 group-hover:text-primary transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
                                                    {post.title}
                                                </h5>
                                                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1"><Heart size={10} /> {post.likeCount}</span>
                                                    <span className="flex items-center gap-1"><MessageCircleQuestion size={10} /> {post.comments?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {professorPosts.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                                        인기글 게시 준비 중... 🔥
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Widget 3: Live AI Assistants Status */}
                        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10"></div>
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-4">
                                <Bot size={18} className="text-emerald-500" />
                                교수님 및 조교 활동 현황
                            </h4>
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div className="text-sm font-medium text-emerald-900 mb-2 leading-relaxed">
                                    현재 교수님 및 <strong className="font-black text-emerald-600">3명</strong>의 조교가 대기 중입니다.
                                </div>
                                <div className="text-xs text-emerald-700/80 font-medium flex items-center justify-between bg-white/60 p-2 rounded-lg">
                                    <span>총 {counselingPosts.length}개의 학생 질문 중</span>
                                    <span className="font-black text-emerald-600">
                                        {counselingPosts.filter(p => p.comments.length > 0).length}개의 답변 완료
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div> {/* End of Sidebar */}

                </div> {/* End of lg:grid */}
            </div>

        </div>
    );
};

// 3. FEED PAGE
const FeedPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId?: CategoryId }>();
    const navigate = useNavigate();
    const { feedPosts, feedHasMore, feedLoading, fetchFeedPosts, resetFeedPosts, followedProfessorIds, openLoginModal, currentUser } = useStore();

    const initialCategory = categoryId || 'ALL';
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
    const [sortBy, setSortBy] = useState<'LATEST' | 'POPULAR'>('LATEST');
    const [filterGrade, setFilterGrade] = useState<GradeType>('ALL');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (categoryId) setSelectedCategory(categoryId);
    }, [categoryId]);

    const [showFilterBar, setShowFilterBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowFilterBar(false);
            } else {
                setShowFilterBar(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Handle Category Selection (Require Login for MY_PROFS)
    const handleCategorySelect = (id: CategoryId) => {
        if (id === 'MY_PROFS' && !currentUser) {
            openLoginModal();
            return;
        }
        setSelectedCategory(id);
    }

    // [Pagination] 필터 변경 시 초기화 후 첫 페이지 조회
    useEffect(() => {
        resetFeedPosts();
        setPage(1);
    }, [selectedCategory, sortBy, filterGrade]);

    // [Pagination] page 변경 시 데이터 조회
    useEffect(() => {
        fetchFeedPosts({
            page,
            categoryId: selectedCategory,
            sortBy,
            filterGrade,
            followedProfessorIds
        });
    }, [page, selectedCategory, sortBy, filterGrade]);

    // [Pagination] Intersection Observer로 무한 스크롤
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && feedHasMore && !feedLoading) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [feedHasMore, feedLoading]);

    // Calculate top 3 popular posts for the sidebar (from currently loaded feedPosts)
    const topPopularPosts = [...feedPosts]
        .filter(p => !p.targetProfessorId && p.categoryId !== 'BREAK' && p.authorRole?.toLowerCase() !== 'professor')
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 3);

    return (
        <>
            <div className="sticky top-14 md:top-16 z-40 bg-white md:bg-transparent shadow-sm md:shadow-none transition-all duration-300">
                <div className="bg-white rounded-b-2xl md:rounded-b-none md:rounded-2xl md:shadow-sm md:mb-4 border-b md:border border-gray-100">
                    <CategoryBar selected={selectedCategory} onSelect={handleCategorySelect} />

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-white md:bg-white md:rounded-b-2xl ${showFilterBar ? 'max-h-[60px] opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}`}>
                        <div className="px-4 py-3 md:px-5 md:pb-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setSortBy('POPULAR')}
                                className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${sortBy === 'POPULAR'
                                    ? 'bg-red-50 text-red-500 ring-1 ring-red-200'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Flame size={14} fill={sortBy === 'POPULAR' ? "currentColor" : "none"} />
                                인기순
                            </button>

                            <button
                                onClick={() => setSortBy('LATEST')}
                                className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${sortBy === 'LATEST'
                                    ? 'bg-blue-50 text-blue-500 ring-1 ring-blue-200'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Clock size={14} />
                                최신순
                            </button>

                            <div className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0"></div>

                            <div className="relative flex-shrink-0">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                    <Filter size={14} className="text-gray-400" />
                                    <select
                                        value={filterGrade}
                                        onChange={(e) => setFilterGrade(e.target.value as GradeType)}
                                        className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer appearance-none pr-4 text-right min-w-[50px]"
                                        style={{ backgroundImage: 'none' }}
                                    >
                                        <option value="ALL">전체학년</option>
                                        <option value="MIDDLE">중등</option>
                                        <option value="H1">고1</option>
                                        <option value="H2">고2</option>
                                        <option value="H3">고3</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-6 md:mt-2">
                <div className="md:col-span-12 lg:col-span-8">
                    <div className={`bg-gray-50 min-h-[calc(100vh-180px)] ${selectedCategory === 'BREAK' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>

                        {feedPosts.map(post => (
                            post.categoryId === 'BREAK'
                                ? <EpisodeCard key={post.id} post={post} />
                                : <PostCard key={post.id} post={post} />
                        ))}

                        {/* [Pagination] Loading Spinner */}
                        {feedLoading && (
                            <div className="flex justify-center items-center py-10 col-span-full">
                                <div className="w-7 h-7 border-3 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* [Pagination] End of List */}
                        {!feedLoading && !feedHasMore && feedPosts.length > 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm col-span-full">
                                <span className="text-lg mr-1">📭</span> 게시글을 모두 불러왔습니다.
                            </div>
                        )}

                        {/* [Pagination] Empty State */}
                        {!feedLoading && feedPosts.length === 0 && (
                            <div className="p-20 text-center text-gray-400 text-sm flex flex-col items-center gap-2 col-span-full">
                                <span className="text-4xl">📭</span>
                                {selectedCategory === 'MY_PROFS'
                                    ? '아직 팔로우한 교수님의 새 글이 없습니다.'
                                    : '조건에 맞는 게시글이 없습니다.'
                                }
                            </div>
                        )}

                        {/* [Pagination] Infinite Scroll Sentinel */}
                        <div ref={sentinelRef} className="h-1 col-span-full" />
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-48 self-start z-10 transition-all duration-300">
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-soft">
                        <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-1">
                            <Flame size={16} className="text-red-500" /> 실시간 인기 세특
                        </h3>
                        <ul className="space-y-3">
                            {topPopularPosts.map((post, index) => (
                                <li
                                    key={post.id}
                                    onClick={() => navigate(`/post/${post.id}`)}
                                    className="text-sm text-gray-600 hover:text-primary cursor-pointer truncate font-medium flex items-center gap-2 group"
                                >
                                    <span className="text-gray-400 font-bold w-3">{index + 1}.</span>
                                    <span className="truncate group-hover:underline">{post.title}</span>
                                </li>
                            ))}
                            {topPopularPosts.length === 0 && (
                                <li className="text-sm text-gray-400">인기 게시물이 없습니다.</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-primary/80 to-primary-dark/80 rounded-2xl p-6 text-white shadow-lg backdrop-saturate-150 border border-white/10">
                        <h3 className="font-bold mb-1 text-lg">세특각 Premium</h3>
                        <p className="text-xs opacity-90 mb-4 font-medium">AI가 분석해주는 나만의 생기부 로드맵</p>
                        <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2.5 rounded-xl transition-colors backdrop-blur-sm border border-white/10">
                            곧 출시 예정
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ArchivePage: React.FC = () => {
    const { trendListItems, trendHasMore, trendLoading, fetchTrendList, resetTrendList } = useStore();
    const [page, setPage] = useState(1);

    useEffect(() => {
        resetTrendList();
        setPage(1);
    }, []);

    useEffect(() => {
        fetchTrendList({ page });
    }, [page]);

    // IntersectionObserver로 무한 스크롤
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && trendHasMore && !trendLoading) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [trendHasMore, trendLoading]);

    return (
        <div className="p-4 md:p-0">
            {/* 헤더 섹션 제거됨 -> Desktop Nav 렌더링으로 위임 */}
            <LeaderboardWidget />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {trendListItems.map(item => (
                    <TrendCard key={item.id} item={item} />
                ))}

                {/* Loading Spinner */}
                {trendLoading && (
                    <div className="flex justify-center items-center py-10 col-span-full">
                        <div className="w-7 h-7 border-3 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}

                {/* End of List */}
                {!trendLoading && !trendHasMore && trendListItems.length > 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm col-span-full">
                        <span className="text-lg mr-1">📭</span> 게시글을 모두 불러왔습니다.
                    </div>
                )}

                {/* Empty State */}
                {!trendLoading && trendListItems.length === 0 && (
                    <div className="p-20 text-center text-gray-400 text-sm flex flex-col items-center gap-2 col-span-full">
                        <span className="text-4xl">📭</span>
                        등록된 이슈떡상이 없습니다.
                    </div>
                )}

                {/* Infinite Scroll Sentinel */}
                <div ref={sentinelRef} className="h-1 col-span-full" />
            </div>
        </div>
    );
};

const ArenaPage: React.FC = () => {
    const { voteListItems, voteHasMore, voteLoading, fetchVoteList, resetVoteList } = useStore();
    const [page, setPage] = useState(1);

    useEffect(() => {
        resetVoteList();
        setPage(1);
    }, []);

    useEffect(() => {
        fetchVoteList({ page });
    }, [page]);

    // IntersectionObserver로 무한 스크롤
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && voteHasMore && !voteLoading) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [voteHasMore, voteLoading]);

    return (
        <div className="p-4 md:p-0">
            {/* 헤더 섹션 제거됨 -> Desktop Nav 렌더링으로 위임 */}
            <div className="md:grid md:grid-cols-12 md:gap-6 md:mt-8">
                <div className="md:col-span-12 lg:col-span-8">
                    <div className="bg-gray-50 min-h-[calc(100vh-180px)]">
                        {voteListItems.map(item => (
                            <ArenaCard key={item.id} item={item} />
                        ))}

                        {/* Loading Spinner */}
                        {voteLoading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-7 h-7 border-3 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* End of List */}
                        {!voteLoading && !voteHasMore && voteListItems.length > 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                <span className="text-lg mr-1">📭</span> 토론을 모두 불러왔습니다.
                            </div>
                        )}

                        {/* Empty State */}
                        {!voteLoading && voteListItems.length === 0 && (
                            <div className="p-20 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                                <span className="text-4xl">📭</span>
                                등록된 토론이 없습니다.
                            </div>
                        )}

                        {/* Infinite Scroll Sentinel */}
                        <div ref={sentinelRef} className="h-1" />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24 self-start z-10 transition-all duration-300">
                    <ArenaHotMatchWidget />
                    <ArenaBestCommentWidget />
                </div>
            </div>
        </div>
    );
};

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const { posts, savedPostIds, currentUser, logout, openLoginModal, followedProfessorIds, weeklyProgress, deletePost } = useStore();
    const [activeList, setActiveList] = useState<'NONE' | 'MY_POSTS' | 'SAVED_POSTS' | 'FOLLOWED_PROFS'>('NONE');

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        setIsDragging(true);
        setDragDistance(0);
        if (scrollRef.current) {
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
            (e.target as Element).setPointerCapture(e.pointerId);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging && scrollRef.current) {
            (e.target as Element).releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        if (scrollRef.current) {
            const x = e.pageX - scrollRef.current.offsetLeft;
            const walk = (x - startX) * 1.5;
            scrollRef.current.scrollLeft = scrollLeft - walk;
            setDragDistance(Math.abs(walk));
        }
    };

    // Calculate Stats
    const myPosts = posts.filter(p => p.isUser && p.uid === currentUser?.uid);
    const myPostCount = myPosts.length;

    // Get Saved Posts
    const savedPosts = posts.filter(p => savedPostIds.has(p.id));
    const savedCount = savedPosts.length;

    // Get Followed Professors
    const followedProfessors = PROFESSORS.filter(p => followedProfessorIds.has(p.id));

    if (!currentUser) {
        return (
            <div className="p-6 md:p-10 text-center max-w-2xl mx-auto md:bg-white md:rounded-3xl md:shadow-soft md:border md:border-gray-100 md:mt-10 min-h-[500px] flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full mb-6 flex items-center justify-center text-4xl shadow-inner">
                    🔒
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">로그인이 필요해요</h2>
                <p className="text-gray-500 text-sm mb-8">
                    세특각에 가입하고<br />더 많은 입시 정보를 확인하세요.
                </p>
                <button
                    onClick={openLoginModal}
                    className="bg-primary text-white font-bold py-3.5 px-10 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                >
                    로그인 / 회원가입
                </button>
            </div>
        );
    }

    const renderPostList = () => {
        if (activeList === 'NONE') return null;

        if (activeList === 'FOLLOWED_PROFS') {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-fade-in-up">
                    <div className="p-4 border-b border-gray-50 font-bold text-gray-900 flex justify-between items-center">
                        <span>팔로잉 교수</span>
                        <button
                            onClick={() => setActiveList('NONE')}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    {followedProfessors.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">팔로우한 교수님이 없습니다.</div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={scrollRef}
                                className="p-4 flex gap-4 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
                                onPointerDown={handlePointerDown}
                                onPointerUp={handlePointerUp}
                                onPointerMove={handlePointerMove}
                            >
                                {followedProfessors.map(prof => (
                                    <div
                                        key={prof.id}
                                        onClick={() => {
                                            if (dragDistance > 5) return;
                                            navigate(`/major/${prof.id}`);
                                        }}
                                        className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer w-20"
                                    >
                                        <div className="w-16 h-20 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={prof.imageUrl} alt={prof.name} className="w-full h-full object-cover object-top" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-800 text-center truncate w-full">{prof.name}</span>
                                        <span className="text-[10px] text-gray-500 text-center truncate w-full">{prof.title}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-br-2xl"></div>
                        </div>
                    )}
                </div>
            );
        }

        const displayPosts = activeList === 'MY_POSTS' ? myPosts : savedPosts;
        const title = activeList === 'MY_POSTS' ? '내가 쓴 글' : '보관함';

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-fade-in-up">
                <div className="p-4 border-b border-gray-50 font-bold text-gray-900 flex justify-between items-center">
                    <span>{title}</span>
                    <button
                        onClick={() => setActiveList('NONE')}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                {displayPosts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">{activeList === 'MY_POSTS' ? '작성한 글이 없습니다.' : '보관한 글이 없습니다.'}</div>
                ) : (
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {displayPosts.map(post => (
                            <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="text-sm font-bold text-gray-800 mb-1 truncate">{post.title}</div>
                                    <div className="text-xs text-gray-400">{post.createdAt} · {post.authorAgent || currentUser.displayName}</div>
                                </div>
                                {activeList === 'MY_POSTS' && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setTimeout(() => {
                                                if (window.confirm('정말 이 작성글을 삭제하시겠습니까?')) {
                                                    deletePost(post.id);
                                                }
                                            }, 100);
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-0 max-w-2xl mx-auto">
            <MyCard />

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div
                    onClick={() => setActiveList(activeList === 'MY_POSTS' ? 'NONE' : 'MY_POSTS')}
                    className={`bg-white p-4 md:p-5 rounded-2xl border ${activeList === 'MY_POSTS' ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-gray-100 hover:border-primary/30'} shadow-sm text-center cursor-pointer transition-all active:scale-[0.98]`}
                >
                    <div className="text-2xl md:text-3xl font-black text-primary mb-1">{myPostCount}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 font-bold break-keep">내가 쓴 글</div>
                </div>
                <div
                    onClick={() => setActiveList(activeList === 'SAVED_POSTS' ? 'NONE' : 'SAVED_POSTS')}
                    className={`bg-white p-4 md:p-5 rounded-2xl border ${activeList === 'SAVED_POSTS' ? 'border-gray-900 ring-1 ring-gray-900/20 bg-gray-50' : 'border-gray-100 hover:border-gray-300'} shadow-sm text-center cursor-pointer transition-all active:scale-[0.98]`}
                >
                    <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{savedCount}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 font-bold break-keep">보관함</div>
                </div>
                <div
                    onClick={() => setActiveList(activeList === 'FOLLOWED_PROFS' ? 'NONE' : 'FOLLOWED_PROFS')}
                    className={`bg-white p-4 md:p-5 rounded-2xl border ${activeList === 'FOLLOWED_PROFS' ? 'border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-50' : 'border-gray-100 hover:border-indigo-300'} shadow-sm text-center cursor-pointer transition-all active:scale-[0.98]`}
                >
                    <div className="text-2xl md:text-3xl font-black text-indigo-500 mb-1">{followedProfessors.length}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 font-bold break-keep">팔로잉 교수</div>
                </div>
            </div>

            <div className="mb-8">
                {renderPostList()}
            </div>

            {/* Weekly Progress Chart */}
            {(() => {
                const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
                const now = new Date();
                const todayDow = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun

                // Build 7-day data array
                const monday = new Date(now);
                monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
                monday.setHours(0, 0, 0, 0);

                const dayData = dayLabels.map((_, idx) => {
                    const date = new Date(monday);
                    date.setDate(monday.getDate() + idx);
                    const dateStr = date.toISOString().split('T')[0];
                    const found = weeklyProgress.find(d => d.score_date === dateStr);
                    return {
                        points: found?.points || 0,
                        correct: found?.correct_count || 0,
                        total: found?.total_count || 0,
                    };
                });

                const maxPoints = Math.max(...dayData.map(d => d.points), 1);
                const totalPoints = dayData.reduce((s, d) => s + d.points, 0);
                const correctCount = dayData.reduce((s, d) => s + d.correct, 0);
                const totalCount = dayData.reduce((s, d) => s + d.total, 0);

                return (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                            📊 이번 주 학습 현황
                        </h3>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between gap-2 h-32 mb-4 px-2">
                            {dayData.map((d, idx) => {
                                const isToday = idx === todayDow;
                                const barHeight = d.points > 0 ? Math.max((d.points / maxPoints) * 100, 8) : 4;
                                const hasData = d.points > 0;

                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                                        {hasData && (
                                            <span className="text-[10px] font-bold text-gray-500">{d.points}</span>
                                        )}
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-500 ${isToday && hasData
                                                ? 'border-2 border-gray-900'
                                                : ''
                                                }`}
                                            style={{
                                                height: `${barHeight}%`,
                                                backgroundColor: hasData
                                                    ? isToday ? '#CCFF00' : 'rgba(139, 92, 246, 0.5)'
                                                    : '#e5e7eb',
                                                minHeight: hasData ? '12px' : '4px',
                                            }}
                                        />
                                        <span className={`text-[11px] font-bold ${isToday ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {dayLabels[idx]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                            <div className="text-center">
                                <div className="text-lg font-black text-primary">{totalPoints} pt</div>
                                <div className="text-[10px] text-gray-500 font-bold">총점</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-black text-gray-900">{correctCount}/{totalCount}</div>
                                <div className="text-[10px] text-gray-500 font-bold">풀이</div>
                            </div>
                        </div>
                    </div>
                );
            })()}




            <button
                onClick={() => {
                    if (window.confirm('정말 로그아웃하시겠습니까?')) {
                        logout();
                    }
                }}
                className="w-full bg-red-50 border border-red-100 p-4 rounded-xl text-left font-bold text-red-500 hover:bg-red-100 transition-colors"
            >
                로그아웃
            </button>
        </div>
    );
};

export default function App() {
    return (
        <HashRouter>
            <StoreProvider>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="feed" element={<FeedPage />} />
                        <Route path="feed/:categoryId" element={<FeedPage />} />
                        <Route path="major/:professorId" element={<MajorIntroPage />} />
                        <Route path="post/:id" element={<PostDetail />} />
                        <Route path="archive" element={<ArchivePage />} />
                        <Route path="archive/:id" element={<TrendDetail />} />
                        <Route path="arena" element={<ArenaPage />} />
                        <Route path="arena/:id" element={<ArenaDetail />} />
                        <Route path="brain" element={<TeacherBrainPage />} />
                        <Route path="brain/:id" element={<TeacherBrainDetail />} />
                        <Route path="break" element={<BreakPage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="write" element={<WritePostPage />} />
                        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                        <Route path="my" element={<MyPage />} />
                    </Route>
                </Routes>
            </StoreProvider>
        </HashRouter>
    );
}