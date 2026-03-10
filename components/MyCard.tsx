import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../utils/supabase';
import { Edit2, Save, X, User as UserIcon, Target, BookOpen, School, Search } from 'lucide-react';
import { GradeType } from '../types';
import { SchoolSearchModal } from './SchoolSearchModal';

export const MyCard: React.FC = () => {
    const { currentUser, updateUserProfile } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Form State
    const [nickname, setNickname] = useState('');
    const [grade, setGrade] = useState<GradeType>('H1');
    const [hopeMajor, setHopeMajor] = useState('');
    const [hopeJob, setHopeJob] = useState('');
    const [careerGoal, setCareerGoal] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [schoolId, setSchoolId] = useState('');

    // Pre-fill form when entering edit mode
    const handleEditClick = () => {
        if (!currentUser) return;
        setNickname(currentUser.displayName || '');
        setGrade(currentUser.grade || 'H1');
        setHopeMajor(currentUser.hopeMajor || '');
        setHopeJob(currentUser.hopeJob || '');
        setCareerGoal(currentUser.careerGoal || '');
        setSchoolName(currentUser.schoolName || '');
        setSchoolId(currentUser.schoolId || '');
        setIsEditing(true);
    };

    if (!currentUser) return null;

    const handleSave = async () => {
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            // Check nickname duplication
            if (nickname !== currentUser.displayName) {
                const { data: existingUser, error: checkError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('nickname', nickname)
                    .neq('id', currentUser.uid)
                    .maybeSingle();

                if (existingUser) {
                    alert('이미 사용 중인 닉네임입니다.');
                    setIsSaving(false);
                    return;
                }
            }

            // Upsert profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: currentUser.uid,
                    nickname,
                    grade,
                    hope_major: hopeMajor,
                    hope_job: hopeJob,
                    career_goal: careerGoal,
                    school_id: schoolId || null,
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            // Sync with auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: nickname,
                    grade: grade
                }
            });

            if (authError) throw authError;

            // Optimistic Update
            updateUserProfile({
                displayName: nickname,
                grade,
                hopeMajor,
                hopeJob,
                careerGoal,
                schoolId,
                schoolName
            });

            setIsEditing(false);
            alert('저장되었습니다.');
        } catch (e) {
            console.error("Save failed:", e);
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const gradeLabels: Record<GradeType, string> = {
        'MIDDLE': '중학생',
        'H1': '고1',
        'H2': '고2',
        'H3': '고3',
        'ADULT': '성인/기타',
        'ALL': '전체'
    };

    if (isEditing) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6 relative">
                <SchoolSearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    onSelect={(id, name) => {
                        setSchoolId(id);
                        setSchoolName(name);
                        setIsSearchModalOpen(false);
                    }}
                />

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg text-gray-900">프로필 수정</h3>
                        <span className="text-xs font-bold text-gray-400">좋은 세특을 위해서는 아래 내용에 대한 고민은 필수! 💡</span>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">이메일 (수정 불가)</label>
                        <input
                            type="text"
                            value={currentUser.email || ''}
                            disabled
                            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 h-[42px] text-sm outline-none cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">학년</label>
                        <select
                            value={grade}
                            onChange={e => setGrade(e.target.value as GradeType)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                        >
                            <option value="MIDDLE">중학생</option>
                            <option value="H1">고1</option>
                            <option value="H2">고2</option>
                            <option value="H3">고3</option>
                            <option value="ADULT">성인/기타</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">학교</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={schoolName}
                                readOnly
                                className="flex-1 border border-gray-200 bg-gray-50 text-gray-700 rounded-xl px-4 h-[42px] text-sm outline-none cursor-not-allowed"
                                placeholder="오른쪽 검색 버튼을 눌러주세요"
                            />
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                disabled={isSaving}
                                className="bg-gray-900 hover:bg-black text-white px-4 h-[42px] rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                                <Search size={16} /> 검색
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">희망 학과</label>
                        <input
                            type="text"
                            value={hopeMajor}
                            onChange={e => setHopeMajor(e.target.value)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="예: 컴퓨터공학과"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">희망 직업</label>
                        <input
                            type="text"
                            value={hopeJob}
                            onChange={e => setHopeJob(e.target.value)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 h-[42px] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="예: 인공지능 엔지니어"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">진로 목표 (진로 희망)</label>
                        <textarea
                            value={careerGoal}
                            onChange={e => setCareerGoal(e.target.value)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-24"
                            placeholder="예: 사람들에게 도움을 주는 인공지능 개발자"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> 저장하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFDF7] border-2 border-gray-900 rounded-[32px] p-6 md:p-8 mb-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
            {/* Cute Decorative Elements */}
            <div className="absolute -top-4 -right-4 text-6xl opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-500">✨</div>
            <div className="absolute -bottom-6 -left-6 text-7xl opacity-20 -rotate-12 group-hover:-rotate-45 transition-transform duration-500">🌸</div>
            <div className="absolute top-1/2 right-10 text-4xl opacity-10 animate-bounce">✏️</div>

            <button
                onClick={handleEditClick}
                className="absolute top-5 right-5 bg-yellow-300 border-2 border-gray-900 shadow-[2px_2px_0px_#111827] text-gray-900 hover:bg-yellow-400 p-2.5 rounded-full transition-all active:translate-y-0.5 active:shadow-[0_0_0_#111827] z-20 flex items-center justify-center group/btn"
            >
                <Edit2 size={16} className="group-hover/btn:-rotate-12 transition-transform" />
            </button>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 text-center sm:text-left">
                    {/* Bubbly Profile Image */}
                    <div className="w-24 h-24 bg-pink-100 rounded-[24px] rotate-[-3deg] border-4 border-gray-900 shadow-[4px_4px_0px_#F472B6] overflow-hidden flex-shrink-0 relative">
                        {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-pink-400">
                                <UserIcon size={40} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 mt-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                            <h2 className="text-[26px] font-black text-gray-900 tracking-tight leading-none px-1 bg-yellow-200/50 rounded-lg">
                                {currentUser.displayName}
                            </h2>
                            <span className="bg-purple-200 text-purple-900 text-xs px-3 py-1.5 rounded-full font-black border-2 border-gray-900 shadow-[2px_2px_0_#000] rotate-2">
                                {gradeLabels[currentUser.grade || 'H1']}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3 items-center sm:items-start">
                            <p className="inline-flex items-center gap-1.5 bg-white border-2 border-gray-900 px-3 py-1.5 rounded-xl text-[13px] font-bold text-gray-700 shadow-[2px_2px_0px_#D1D5DB]">
                                <School size={14} className="text-gray-500" />
                                {currentUser.schoolName || '소속 학교 없음'}
                            </p>
                            <p className="text-gray-500 text-xs font-bold px-1">
                                {currentUser.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fun Metadata Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#EEF2FF] border-2 border-gray-900 rounded-2xl p-3 shadow-[3px_3px_0px_#818CF8] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#818CF8] hover:-rotate-1 transition-all cursor-default flex-1 flex flex-col justify-center">
                            <div className="text-indigo-900 text-[11px] font-black uppercase flex items-center gap-1.5 mb-1">
                                <span className="text-base">🎒</span> 희망 학과
                            </div>
                            <div className="font-extrabold text-gray-900 text-[14px] pl-1 break-words">
                                {currentUser.hopeMajor || <span className="text-indigo-400/80 font-bold">비밀이에요 🤫</span>}
                            </div>
                        </div>

                        <div className="bg-[#ECFDF5] border-2 border-gray-900 rounded-2xl p-3 shadow-[3px_3px_0px_#34D399] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#34D399] hover:rotate-1 transition-all cursor-default flex-1 flex flex-col justify-center">
                            <div className="text-emerald-900 text-[11px] font-black uppercase flex items-center gap-1.5 mb-1">
                                <span className="text-base">💼</span> 희망 직업
                            </div>
                            <div className="font-extrabold text-gray-900 text-[14px] pl-1 break-words">
                                {currentUser.hopeJob || <span className="text-emerald-400/80 font-bold">비밀이에요 🤫</span>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FDF2F8] border-2 border-gray-900 rounded-2xl p-4 shadow-[3px_3px_0px_#F472B6] hover:-translate-y-1 hover:shadow-[5px_5px_0px_#F472B6] hover:rotate-1 transition-all cursor-default flex flex-col h-full">
                        <div className="text-pink-900 text-[12px] font-black uppercase flex items-center gap-1.5 mb-2">
                            <span className="text-lg">🎯</span> 진로 목표
                        </div>
                        <div className="font-extrabold text-gray-900 text-[15px] pl-1 break-words leading-relaxed flex-1">
                            {currentUser.careerGoal || <span className="text-pink-400/80 font-bold">아직 고민 중이에요 🤔</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
