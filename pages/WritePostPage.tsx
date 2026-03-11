
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Compass, Link as LinkIcon, Lightbulb, RefreshCcw, AlertCircle } from 'lucide-react';
import { CATEGORIES, PROFESSORS } from '../constants';
import { CategoryId, GradeType } from '../types';
import { useStore } from '../context/StoreContext';
import { getChaptersForSemester } from '../utils/curriculumData';

type CounselingType = 'ROADMAP' | 'CONNECTION' | 'SOLUTION';

export const WritePostPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'FEED'; // FEED, ARCHIVE, ARENA, COUNSELING
    const profId = searchParams.get('profId'); // For COUNSELING mode
    const { addPost, addTrend, addVote, currentUser, openLoginModal, isAdmin } = useStore();

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            openLoginModal();
            navigate('/', { replace: true });
            return;
        }

        // Access Control for Archive
        if (type === 'ARCHIVE' && !isAdmin) {
            alert('이슈떡상 자료 올리기는 관리자만 가능합니다.');
            navigate('/archive', { replace: true });
        }
    }, [currentUser, navigate, openLoginModal, type, isAdmin]);

    // Common State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Used for Post Content, Archive Summary, Arena Description

    // Feed & Counseling State
    const [categoryId, setCategoryId] = useState<CategoryId>('BIO_MED');
    const [targetGrade, setTargetGrade] = useState<GradeType>('H1'); // Default to H1

    // Archive State
    const [archiveCategoryId, setArchiveCategoryId] = useState<CategoryId>('BIO_MED');
    const [keyword, setKeyword] = useState('');
    const [seTeukTip, setSeTeukTip] = useState('');

    // Arena State
    const [optionA, setOptionA] = useState('');
    const [optionB, setOptionB] = useState('');

    // --- Counseling Specific State ---
    const [counselingStep, setCounselingStep] = useState<'SELECT_TYPE' | 'FORM'>('SELECT_TYPE');
    const [counselingType, setCounselingType] = useState<CounselingType | null>(null);

    // Counseling Form Data
    const [cForm, setCForm] = useState({
        // Common
        currentGrade: '',
        major: '',
        // Roadmap
        ambition: '',
        additionalInfo: '',
        // Connection
        prevGrade: 'H1',
        prevSemester: '1',
        prevSubject: '',
        prevTopic: '',
        prevRecord: '',
        targetGrade: 'H2',
        targetSemester: '1',
        targetSubject: '',
        targetConcern: '',
        // Solution
        topicIdea: '',
        blocker: '',
        request: ''
    });

    // Find Professor info if Counseling mode
    const targetProfessor = profId ? PROFESSORS.find(p => p.id === profId) : null;

    // Update default grade based on user profile if available
    useEffect(() => {
        if (currentUser?.grade) {
            setTargetGrade(currentUser.grade);
            setCForm(prev => ({ ...prev, currentGrade: currentUser.grade === 'H1' ? '고1' : currentUser.grade === 'H2' ? '고2' : '고3' }));
        }
        // Auto-set Category if Counseling mode
        if (type === 'COUNSELING' && targetProfessor) {
            setCategoryId(targetProfessor.categoryId);
        }
    }, [currentUser, type, targetProfessor]);

    // If redirecting, don't render content
    if (!currentUser) return null;
    if (type === 'ARCHIVE' && !isAdmin) return null;

    const getTitle = () => {
        switch (type) {
            case 'ARCHIVE': return '이슈떡상 자료 공유';
            case 'ARENA': return '토론 발제';
            case 'COUNSELING': return `${targetProfessor?.name} 교수님께 질문`;
            default: return '탐구줍줍 질문/공유';
        }
    }

    // --- Counseling Logic ---
    // Helper to check availability based on grade
    const isRoadmapAvailable = ['H1', 'H2', 'MIDDLE', 'ALL'].includes(targetGrade);
    const isConnectionAvailable = ['H1', 'H2', 'H3', 'ALL'].includes(targetGrade);

    const handleCounselingTypeSelect = (cType: CounselingType) => {
        // Validate Grade Restriction
        if (cType === 'ROADMAP' && !isRoadmapAvailable) {
            alert("로드맵 설계형은 고1, 고2 학생에게 최적화되어 있습니다.");
            return;
        }
        if (cType === 'CONNECTION' && !isConnectionAvailable) {
            alert("세특 꼬꼬무 유형은 고등학생에게 적합합니다.");
            return;
        }

        setCounselingType(cType);
        setCounselingStep('FORM');

        // Auto-fill Title Template
        if (!title) {
            const typeName = cType === 'ROADMAP' ? '로드맵 설계' : cType === 'CONNECTION' ? '세특 꼬꼬무' : '주제 솔루션';
            setTitle(`[${typeName}] 교수님, 질문 있습니다!`);
        }
    };

    const buildCounselingContent = () => {
        if (!counselingType) return content;

        let builtContent = "";
        if (counselingType === 'ROADMAP') {
            builtContent = `[상담 유형: 🚀 로드맵 설계형]\n\n` +
                `1. 현재 학년: ${cForm.currentGrade}\n` +
                `2. 희망 학과: ${cForm.major}\n` +
                `3. 진로 목표: ${cForm.ambition}\n` +
                `4. 추가 전달사항: ${cForm.additionalInfo}`;
        } else if (counselingType === 'CONNECTION') {
            const hints = getChaptersForSemester(cForm.targetGrade, cForm.targetSemester, cForm.targetSubject);

            builtContent = `[상담 유형: 🔗 세특 꼬꼬무]\n\n` +
                `1. 이전 활동 정보:\n` +
                `  - 시기: ${cForm.prevGrade === 'H1' ? '고1' : cForm.prevGrade === 'H2' ? '고2' : '고3'} ${cForm.prevSemester}학기\n` +
                `  - 과목: ${cForm.prevSubject}\n` +
                `  - 주제: ${cForm.prevTopic}\n` +
                `  - 세특 원문:\n${cForm.prevRecord}\n\n` +
                `2. 이번 타겟 활동 (목표):\n` +
                `  - 시기: ${cForm.targetGrade === 'H1' ? '고1' : cForm.targetGrade === 'H2' ? '고2' : '고3'} ${cForm.targetSemester}학기\n` +
                `  - 타겟 과목: ${cForm.targetSubject}\n` +
                `  - 타겟 단원명 힌트: ${hints.length > 0 ? hints.join(', ') : '없음'}\n` +
                `  - 추가 전달사항: ${cForm.targetConcern || '없음'}\n`;
        } else if (counselingType === 'SOLUTION') {
            builtContent = `[상담 유형: 💡 주제 팩트체크/솔루션형]\n\n` +
                `1. 현재 학년: ${cForm.currentGrade}\n` +
                `2. 탐구 과목: ${cForm.targetSubject}\n` +
                `3. 생각해둔 주제: ${cForm.topicIdea}\n` +
                `4. 현재 막히는 부분: ${cForm.blocker}\n` +
                `5. 요청사항: ${cForm.request}`;
        }
        return builtContent;
    };

    const isCounselingValid = () => {
        if (!title.trim()) return false;
        if (counselingStep === 'SELECT_TYPE') return false;

        if (counselingType === 'ROADMAP') {
            return cForm.currentGrade && cForm.major && cForm.ambition;
        }
        if (counselingType === 'CONNECTION') {
            return cForm.prevSubject && cForm.prevTopic && cForm.prevRecord && cForm.targetSubject;
        }
        if (counselingType === 'SOLUTION') {
            return cForm.currentGrade && cForm.targetSubject && cForm.topicIdea && cForm.blocker;
        }
        return false;
    };

    const isValid = () => {
        if (type === 'COUNSELING') return isCounselingValid();
        if (!title.trim()) return false;
        if (type === 'FEED' && !content.trim()) return false;
        if (type === 'ARCHIVE' && (!keyword.trim() || !content.trim())) return false;
        if (type === 'ARENA' && (!content.trim() || !optionA.trim() || !optionB.trim())) return false;
        return true;
    }

    const handleSubmit = () => {
        if (!isValid()) return;

        if (type === 'ARCHIVE') {
            const targetCategoryName = CATEGORIES.find(c => c.id === archiveCategoryId)?.name || '기타';
            addTrend({
                title,
                targetMajor: targetCategoryName, // Use mapped name
                keyword,
                imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/800/600`, // Update to Picsum
                summary: [content.substring(0, 30) + '...'], // Simple summary from content
                content,
                seTeukTip: seTeukTip || '학생들의 창의적인 연결을 기대합니다!'
            });
            navigate('/archive');
        } else if (type === 'ARENA') {
            addVote({
                title,
                description: content,
                optionA,
                optionB
            });
            navigate('/arena');
        } else {
            // Feed & Counseling
            const finalContent = type === 'COUNSELING' ? buildCounselingContent() : content;

            addPost({
                categoryId,
                title,
                content: finalContent,
                previewText: finalContent.substring(0, 50) + '...',
                authorAgent: currentUser?.displayName || '익명 학생',
                tags: type === 'COUNSELING' ? ['Q&A', '상담', counselingType || '일반'] : ['질문', '세특'],
                targetGrade: targetGrade, // Pass the selected grade
                targetProfessorId: type === 'COUNSELING' ? profId : undefined // Pass Prof ID if Counseling
            });

            if (type === 'COUNSELING') {
                // [Modified] 상담 탭으로 바로 이동하도록 query param 추가
                navigate(`/major/${profId}?tab=COUNSELING`);
            } else {
                navigate('/');
            }
        }
    };

    const gradeOptions: { value: GradeType; label: string }[] = [
        { value: 'H1', label: '고1' },
        { value: 'H2', label: '고2' },
        { value: 'H3', label: '고3' },
        { value: 'MIDDLE', label: '중등' },
        { value: 'ALL', label: '전체' },
    ];

    return (
        <div className="bg-white min-h-screen md:max-w-4xl md:mx-auto md:my-8 md:rounded-2xl md:shadow-xl md:min-h-[600px] overflow-hidden text-gray-900">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            if (type === 'COUNSELING' && profId) {
                                navigate(`/major/${profId}?tab=COUNSELING`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-800" />
                    </button>
                    <span className="ml-2 font-bold text-lg text-gray-900">{getTitle()}</span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid()}
                    className="text-primary font-bold text-sm px-3 py-1.5 rounded-full hover:bg-primary-soft disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                    완료
                </button>
            </div>

            <div className="p-6">

                {/* === COUNSELING FORM === */}
                {type === 'COUNSELING' && (
                    <div className="animate-fade-in">
                        {counselingStep === 'SELECT_TYPE' ? (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">어떤 고민이 있으신가요?</h2>
                                    <p className="text-sm text-gray-500 mb-4">학년에 따라 신청 가능한 상담이 달라집니다.</p>
                                </div>

                                {/* 1. ROADMAP (Restricted: H1, H2, MIDDLE) */}
                                <button
                                    onClick={() => handleCounselingTypeSelect('ROADMAP')}
                                    disabled={!isRoadmapAvailable}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all group relative overflow-hidden flex items-start gap-4 ${isRoadmapAvailable
                                        ? 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl transition-transform ${isRoadmapAvailable ? 'bg-indigo-100 text-indigo-600 group-hover:scale-110' : 'bg-gray-200 text-gray-400'}`}>
                                        <Compass size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold text-lg ${isRoadmapAvailable ? 'text-gray-900 group-hover:text-primary' : 'text-gray-400'}`}>
                                                🚀 로드맵 설계형
                                            </h3>
                                            {!isRoadmapAvailable && <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">고1/2 전용</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 font-medium">아직 진로 방향만 잡혔다면? 3년 치 큰 그림을 그려드립니다.</p>
                                        <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-400">#ZeroToOne #진로설계</span>
                                    </div>
                                </button>

                                {/* 2. CONNECTION (Restricted: H1, H2, H3) */}
                                <button
                                    onClick={() => handleCounselingTypeSelect('CONNECTION')}
                                    disabled={!isConnectionAvailable}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all group relative overflow-hidden flex items-start gap-4 ${isConnectionAvailable
                                        ? 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl transition-transform ${isConnectionAvailable ? 'bg-rose-100 text-rose-600 group-hover:scale-110' : 'bg-gray-200 text-gray-400'}`}>
                                        <LinkIcon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold text-lg ${isConnectionAvailable ? 'text-gray-900 group-hover:text-primary' : 'text-gray-400'}`}>
                                                🔗 세특 꼬꼬무
                                            </h3>
                                            {!isConnectionAvailable && <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">고등 전용</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 font-medium">이전 목표나 아쉬웠던 활동이 있나요? 꼬리에 꼬리를 무는 심화 탐구로 연결해드립니다.</p>
                                        <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-400">#스토리텔링 #심화탐구</span>
                                    </div>
                                </button>

                                {/* 3. SOLUTION (Open to All) */}
                                <button
                                    onClick={() => handleCounselingTypeSelect('SOLUTION')}
                                    className="w-full text-left p-5 rounded-2xl border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="bg-amber-100 text-amber-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                            <Lightbulb size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">💡 주제 팩트체크/솔루션형</h3>
                                            <p className="text-xs text-gray-500 mb-2 font-medium">생각해둔 주제가 있는데 막히시나요? 구체적인 방법론을 제시해드립니다.</p>
                                            <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-400">#주제검증 #실험설계</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${counselingType === 'ROADMAP' ? 'text-indigo-600 bg-indigo-50 border-indigo-200' :
                                        counselingType === 'CONNECTION' ? 'text-rose-600 bg-rose-50 border-rose-200' :
                                            'text-amber-600 bg-amber-50 border-amber-200'
                                        }`}>
                                        {counselingType === 'ROADMAP' ? '🚀 로드맵 설계형' : counselingType === 'CONNECTION' ? '🔗 세특 꼬꼬무' : '💡 솔루션형'}
                                    </span>
                                    <button
                                        onClick={() => setCounselingStep('SELECT_TYPE')}
                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    >
                                        <RefreshCcw size={12} /> 유형 변경
                                    </button>
                                </div>

                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="질문 제목을 입력하세요"
                                    className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 border-b border-gray-100 pb-4 outline-none focus:border-primary transition-colors bg-white"
                                />

                                {/* --- Dynamic Forms based on Type --- */}

                                {counselingType === 'ROADMAP' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">현재 학년</label>
                                                <select
                                                    value={cForm.currentGrade}
                                                    onChange={e => setCForm({ ...cForm, currentGrade: e.target.value })}
                                                    className="w-full h-[42px] bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                >
                                                    <option value="" disabled>학년 선택</option>
                                                    <option value="고1">고1</option>
                                                    <option value="고2">고2</option>
                                                    <option value="고3">고3</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">희망 학과</label>
                                                <input
                                                    value={cForm.major}
                                                    onChange={e => setCForm({ ...cForm, major: e.target.value })}
                                                    placeholder="예: 기계공학과"
                                                    className="w-full h-[42px] bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">진로 목표</label>
                                            <textarea
                                                value={cForm.ambition}
                                                onChange={e => setCForm({ ...cForm, ambition: e.target.value })}
                                                placeholder="예: 로봇 엔지니어가 되어, 장애인들을 보조하는 기구를 만들겠습니다."
                                                className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary resize-none placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">추가 전달사항 (선택)</label>
                                            <textarea
                                                value={cForm.additionalInfo}
                                                onChange={e => setCForm({ ...cForm, additionalInfo: e.target.value })}
                                                placeholder="예: 데이터 분석 좋아합니다, 고등학교 실험실 수준으로 희망합니다, 실험이 없으면 좋겠어요 등"
                                                className="w-full h-20 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary resize-none placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                )}

                                {counselingType === 'CONNECTION' && (
                                    <div className="space-y-6">
                                        {/* 이전 활동 정보 */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <p className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 flex items-center gap-1">⏪ 나의 이전 활동 정보 <span className="text-[10px] font-normal text-gray-500">(생기부 베이스캠프)</span></p>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1">활동 시기</label>
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={cForm.prevGrade}
                                                                onChange={e => setCForm({ ...cForm, prevGrade: e.target.value })}
                                                                className="w-1/2 h-[42px] bg-white border border-gray-200 rounded-lg px-2 text-sm outline-none focus:border-primary"
                                                            >
                                                                <option value="H1">1학년</option>
                                                                <option value="H2">2학년</option>
                                                                <option value="H3">3학년</option>
                                                            </select>
                                                            <select
                                                                value={cForm.prevSemester}
                                                                onChange={e => setCForm({ ...cForm, prevSemester: e.target.value })}
                                                                className="w-1/2 h-[42px] bg-white border border-gray-200 rounded-lg px-2 text-sm outline-none focus:border-primary"
                                                            >
                                                                <option value="1">1학기</option>
                                                                <option value="2">2학기</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1">과목명</label>
                                                        <input
                                                            value={cForm.prevSubject}
                                                            onChange={e => setCForm({ ...cForm, prevSubject: e.target.value })}
                                                            placeholder="예: 통합과학1"
                                                            className="w-full h-[42px] bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">이전 탐구 주제</label>
                                                    <input
                                                        value={cForm.prevTopic}
                                                        onChange={e => setCForm({ ...cForm, prevTopic: e.target.value })}
                                                        placeholder="예: 자율주행 자동차 라이다 센서의 한계점"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-rose-500 mb-1">세특 원문 <span className="text-[10px] text-gray-500 font-normal">(중요! 생기부 복붙)</span></label>
                                                    <textarea
                                                        value={cForm.prevRecord}
                                                        onChange={e => setCForm({ ...cForm, prevRecord: e.target.value })}
                                                        placeholder="생기부에 적힌 해당 과목의 세특 내용을 복사해서 그대로 붙여넣어 주세요."
                                                        className="w-full h-28 bg-white border border-rose-200 rounded-lg p-3 text-sm outline-none focus:border-rose-500 resize-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 타겟 활동 정보 */}
                                        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                            <p className="text-sm font-bold text-gray-800 mb-3 border-b border-rose-200/50 pb-2 flex items-center gap-1">⏩ 이번에 추천받고 싶은 타겟 활동 <span className="text-[10px] font-normal text-gray-500">(목표)</span></p>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1">타겟 시기</label>
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={cForm.targetGrade}
                                                                onChange={e => setCForm({ ...cForm, targetGrade: e.target.value })}
                                                                className="w-1/2 h-[42px] bg-white border border-gray-200 rounded-lg px-2 text-sm outline-none focus:border-primary"
                                                            >
                                                                <option value="H1">1학년</option>
                                                                <option value="H2">2학년</option>
                                                                <option value="H3">3학년</option>
                                                            </select>
                                                            <select
                                                                value={cForm.targetSemester}
                                                                onChange={e => setCForm({ ...cForm, targetSemester: e.target.value })}
                                                                className="w-1/2 h-[42px] bg-white border border-gray-200 rounded-lg px-2 text-sm outline-none focus:border-primary"
                                                            >
                                                                <option value="1">1학기</option>
                                                                <option value="2">2학기</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1">타겟 과목명</label>
                                                        <input
                                                            value={cForm.targetSubject}
                                                            onChange={e => setCForm({ ...cForm, targetSubject: e.target.value })}
                                                            placeholder="예: 물리학"
                                                            className="w-full h-[42px] bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                        />
                                                    </div>
                                                </div>

                                                {/* 단원 힌트 (커리큘럼 연동) */}
                                                {cForm.targetSubject && getChaptersForSemester(cForm.targetGrade, cForm.targetSemester, cForm.targetSubject).length > 0 && (
                                                    <div className="bg-white px-3 py-2 rounded-lg border border-indigo-100">
                                                        <p className="text-[10px] font-bold text-indigo-600 mb-1">📘 이번 {cForm.targetSemester}학기 {cForm.targetSubject} 수업에서는 이런 내용을 배워요!</p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {getChaptersForSemester(cForm.targetGrade, cForm.targetSemester, cForm.targetSubject).map(ch => (
                                                                <span key={ch} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">#{ch}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">추가 전달사항 <span className="font-normal text-gray-400">(선택)</span></label>
                                                    <textarea
                                                        value={cForm.targetConcern}
                                                        onChange={e => setCForm({ ...cForm, targetConcern: e.target.value })}
                                                        placeholder="예: 물리 원리와 제 진로(컴공)를 엮어서 탐구보고서를 써야 합니다."
                                                        className="w-full h-16 bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-primary resize-none placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {counselingType === 'SOLUTION' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">현재 학년</label>
                                                <select
                                                    value={cForm.currentGrade}
                                                    onChange={e => setCForm({ ...cForm, currentGrade: e.target.value })}
                                                    className="w-full h-[42px] bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                >
                                                    <option value="" disabled>학년 선택</option>
                                                    <option value="고1">고1</option>
                                                    <option value="고2">고2</option>
                                                    <option value="고3">고3</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">탐구 과목</label>
                                                <input
                                                    value={cForm.targetSubject}
                                                    onChange={e => setCForm({ ...cForm, targetSubject: e.target.value })}
                                                    placeholder="예: 화학1"
                                                    className="w-full h-[42px] bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">생각해둔 주제</label>
                                            <input
                                                value={cForm.topicIdea}
                                                onChange={e => setCForm({ ...cForm, topicIdea: e.target.value })}
                                                placeholder="예: 아스피린 합성 실험 수율 높이기"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-amber-600 mb-1">현재 막히는 부분</label>
                                            <textarea
                                                value={cForm.blocker}
                                                onChange={e => setCForm({ ...cForm, blocker: e.target.value })}
                                                placeholder="예: 교과서 실험은 너무 뻔한데, 촉매를 바꿔봐도 될까요?"
                                                className="w-full h-24 bg-white border border-amber-200 rounded-lg p-3 text-sm outline-none focus:border-amber-500 resize-none placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">요청사항</label>
                                            <input
                                                value={cForm.request}
                                                onChange={e => setCForm({ ...cForm, request: e.target.value })}
                                                placeholder="예: 실험 과정 디테일이 중요함"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                )}

                {/* === FEED FORM === */}
                {type === 'FEED' && (
                    <>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-900 mb-2">대상 학년</label>
                            <div className="flex flex-wrap gap-2">
                                {gradeOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTargetGrade(opt.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${targetGrade === opt.value
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {targetGrade === opt.value && <Check size={12} />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-900 mb-2">관심 분야 (카테고리)</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${categoryId === cat.id
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 border-b border-gray-100 pb-4 mb-4 outline-none focus:border-primary transition-colors bg-white"
                        />

                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="수행평가나 세특 관련 궁금한 점을 자유롭게 물어보세요."
                            className="w-full h-80 resize-none text-base text-gray-800 placeholder:text-gray-300 outline-none leading-relaxed bg-white"
                        />
                    </>
                )}

                {/* === ARCHIVE FORM === */}
                {type === 'ARCHIVE' && (
                    <div className="space-y-4">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="탐구 주제 제목 (예: 양자역학 3분 요약)"
                            className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 border-b border-gray-100 pb-4 outline-none focus:border-primary transition-colors bg-white"
                        />

                        {/* Category Selection for Archive */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">관련 학과/계열 (태그)</label>
                            <div className="flex flex-wrap gap-2">
                                {/* Filter out ALL and BREAK */}
                                {CATEGORIES.filter(c => c.id !== 'ALL' && c.id !== 'BREAK' && c.id !== 'MY_PROFS').map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setArchiveCategoryId(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${archiveCategoryId === cat.id
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">핵심 키워드</label>
                            <input
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                placeholder="예: 양자중첩"
                                className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">내용 설명 (3분 요약)</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="어려운 개념을 쉽게 설명해주세요."
                                className="w-full h-32 resize-none bg-gray-50 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-primary mb-2">세특 연결 꿀팁</label>
                            <textarea
                                value={seTeukTip}
                                onChange={e => setSeTeukTip(e.target.value)}
                                placeholder="이 주제를 생기부에 어떻게 녹이면 좋을까요?"
                                className="w-full h-24 resize-none bg-primary-soft/30 border border-primary/20 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}

                {/* === ARENA FORM === */}
                {type === 'ARENA' && (
                    <div className="space-y-6">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="토론 주제 (예: 의대 정원 확대, 찬성 vs 반대)"
                            className="w-full text-xl font-bold text-gray-900 placeholder:text-gray-300 border-b border-gray-100 pb-4 outline-none focus:border-primary transition-colors bg-white"
                        />

                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="토론 배경이나 이슈에 대해 설명해주세요."
                            className="w-full h-32 resize-none bg-gray-50 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <label className="block text-xs font-bold text-primary mb-2 text-center">옵션 A (찬성)</label>
                                <input
                                    value={optionA}
                                    onChange={e => setOptionA(e.target.value)}
                                    placeholder="내용 입력"
                                    className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none text-center"
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-xs font-bold text-blue-500 mb-2 text-center">옵션 B (반대)</label>
                                <input
                                    value={optionB}
                                    onChange={e => setOptionB(e.target.value)}
                                    placeholder="내용 입력"
                                    className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none text-center"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
