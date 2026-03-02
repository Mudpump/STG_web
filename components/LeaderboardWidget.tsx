
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trophy, Medal, User, School } from 'lucide-react';

export const LeaderboardWidget: React.FC = () => {
    const { leaderboard, schoolLeaderboard, userRank, currentUser } = useStore();
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
    const [tab, setTab] = useState<'STUDENT' | 'SCHOOL'>('STUDENT');

    const studentData = leaderboard ? leaderboard[period] || [] : [];
    const schoolData = schoolLeaderboard ? schoolLeaderboard[period] || [] : [];
    const myRank = userRank ? userRank[period] : null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-primary-dark rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Trophy size={100} />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-black text-lg flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} />
                    독해 랭킹
                </h3>
                <div className="bg-white/10 p-1 rounded-lg flex text-xs font-bold">
                    <button
                        onClick={() => setPeriod('WEEKLY')}
                        className={`px-3 py-1 rounded-md transition-all ${period === 'WEEKLY' ? 'bg-white text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                        주간
                    </button>
                    <button
                        onClick={() => setPeriod('MONTHLY')}
                        className={`px-3 py-1 rounded-md transition-all ${period === 'MONTHLY' ? 'bg-white text-primary' : 'text-white/60 hover:text-white'}`}
                    >
                        월간
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-4 relative z-10 border-b border-white/10 pb-2">
                <button
                    onClick={() => setTab('STUDENT')}
                    className={`text-sm font-bold pb-2 px-2 border-b-2 transition-colors ${tab === 'STUDENT' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/60 hover:text-white'}`}
                >
                    학생 랭킹
                </button>
                <button
                    onClick={() => setTab('SCHOOL')}
                    className={`text-sm font-bold pb-2 px-2 border-b-2 transition-colors ${tab === 'SCHOOL' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white/60 hover:text-white'}`}
                >
                    학교 랭킹
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                {tab === 'STUDENT' ? (
                    studentData.length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm">
                            아직 랭킹 데이터가 없습니다.<br />
                            <span className="text-yellow-300/80">퀴즈를 풀고 첫 번째 랭커가 되어보세요!</span>
                        </div>
                    ) : (
                        studentData.slice(0, 3).map((user, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${user.isUser ? 'bg-white/20 border border-white/30' : 'bg-white/10 border border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 flex justify-center font-black text-lg italic">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><User size={14} /></div>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm">
                                        {user.nickname}
                                        {user.isUser && <span className="ml-1 text-[10px] bg-primary px-1.5 py-0.5 rounded text-white">나</span>}
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-yellow-400 text-sm">
                                    {user.points} pt
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    schoolData.length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm">
                            아직 학교 랭킹 데이터가 없습니다.<br />
                            <span className="text-yellow-300/80">학교를 등록하고 팀 랭킹에 참여하세요!</span>
                        </div>
                    ) : (
                        schoolData.slice(0, 5).map((school, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 flex justify-center font-black text-lg italic">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                                        <School size={14} className="text-white/80" />
                                    </div>
                                    <div className="font-bold text-sm">
                                        {school.schoolName}
                                        <span className="ml-1 text-[10px] text-white/60 font-normal">{school.region}</span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-yellow-400 text-sm">
                                    {school.totalPoints} pt
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {tab === 'STUDENT' && currentUser && !studentData.slice(0, 3).some(u => u.isUser) && (
                <div className="mt-3 pt-3 border-t border-white/10 text-center text-xs text-white/60 font-medium">
                    {myRank ? (
                        <>내 순위: {myRank.rank}위 ({myRank.totalPoints} pt) <br /></>
                    ) : (
                        <>내 순위: — ({currentUser.points || 0} pt) <br /></>
                    )}
                    <span className="text-yellow-300">문제를 더 풀고 랭킹에 도전하세요!</span>
                </div>
            )}
        </div>
    );
};
