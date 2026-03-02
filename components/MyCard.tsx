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
    const [careerGoal, setCareerGoal] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [schoolId, setSchoolId] = useState('');

    // Pre-fill form when entering edit mode
    const handleEditClick = () => {
        if (!currentUser) return;
        setNickname(currentUser.displayName || '');
        setGrade(currentUser.grade || 'H1');
        setHopeMajor(currentUser.hopeMajor || '');
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
                    <h3 className="font-black text-lg text-gray-900">프로필 수정</h3>
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
                            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">학년</label>
                        <select
                            value={grade}
                            onChange={e => setGrade(e.target.value as GradeType)}
                            disabled={isSaving}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
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
                                className="flex-1 border border-gray-200 bg-gray-50 text-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                                placeholder="오른쪽 검색 버튼을 눌러주세요"
                            />
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                disabled={isSaving}
                                className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"
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
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="예: 컴퓨터공학과"
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
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-primary rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

            <button
                onClick={handleEditClick}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors z-20"
            >
                <Edit2 size={16} className="text-white" />
            </button>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full border-2 border-white/50 shadow-inner overflow-hidden flex-shrink-0 backdrop-blur-md">
                        {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/80">
                                <UserIcon size={32} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black tracking-tight">{currentUser.displayName}</h2>
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold backdrop-blur-sm border border-white/20">
                                {gradeLabels[currentUser.grade || 'H1']}
                            </span>
                        </div>
                        <p className="text-white/80 text-sm font-medium flex items-center gap-1 mb-0.5">
                            <School size={14} />
                            {currentUser.schoolName || '학교를 설정해주세요'}
                        </p>
                        <p className="text-white/60 text-[11px] font-medium truncate">
                            {currentUser.email}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
                        <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <BookOpen size={12} /> 희망 학과
                        </div>
                        <div className="font-bold text-sm truncate">
                            {currentUser.hopeMajor || <span className="text-white/40 italic font-normal">학과를 입력해주세요</span>}
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
                        <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Target size={12} /> 진로 목표
                        </div>
                        <div className="font-bold text-sm line-clamp-2 leading-snug">
                            {currentUser.careerGoal || <span className="text-white/40 italic font-normal">목표를 입력해주세요</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
