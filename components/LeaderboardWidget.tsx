
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
        <div className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm mb-6 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-8 text-gray-50 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0">
                <Trophy size={120} />
            </div>

            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                    <h3 className="font-logo text-xl font-bold text-gray-900 tracking-tight">
                        독해 랭킹
                    </h3>
                </div>
                <div className="bg-gray-100 p-1 rounded-xl flex text-xs">
                    <button
                        onClick={() => setPeriod('WEEKLY')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${period === 'WEEKLY' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'text-gray-500 font-medium hover:text-gray-700'}`}
                    >
                        주간
                    </button>
                    <button
                        onClick={() => setPeriod('MONTHLY')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${period === 'MONTHLY' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'text-gray-500 font-medium hover:text-gray-700'}`}
                    >
                        월간
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-4 relative z-10 border-b border-gray-100 pb-0 px-1">
                <button
                    onClick={() => setTab('STUDENT')}
                    className={`text-sm font-bold pb-3 px-1 border-b-2 transition-colors ${tab === 'STUDENT' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    학생 랭킹
                </button>
                <button
                    onClick={() => setTab('SCHOOL')}
                    className={`text-sm font-bold pb-3 px-1 border-b-2 transition-colors ${tab === 'SCHOOL' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    학교 랭킹
                </button>
            </div>

            <div className="space-y-2 relative z-10 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {tab === 'STUDENT' ? (
                    studentData.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200/60 mt-2">
                            아직 랭킹 데이터가 없습니다.<br />
                            <span className="text-indigo-500 font-medium mt-1 inline-block">퀴즈를 풀고 첫 번째 랭커가 되어보세요!</span>
                        </div>
                    ) : (
                        studentData.slice(0, 30).map((user, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl transition-colors border ${user.isUser ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 flex justify-center font-black text-lg italic text-gray-800">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (
                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[11px] font-bold not-italic">
                                                {idx + 1}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="font-bold text-sm text-gray-900">
                                        {user.nickname}
                                        {user.isUser && <span className="ml-1.5 text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded-md text-white font-bold">나</span>}
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-indigo-600 text-sm bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {user.points} pt
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    schoolData.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200/60 mt-2">
                            아직 학교 랭킹 데이터가 없습니다.<br />
                            <span className="text-indigo-500 font-medium mt-1 inline-block">학교를 등록하고 팀 랭킹에 참여하세요!</span>
                        </div>
                    ) : (
                        schoolData.slice(0, 30).map((school, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 flex justify-center font-black text-lg italic text-gray-800">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (
                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[11px] font-bold not-italic">
                                                {idx + 1}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                        <School size={14} className="text-gray-400" />
                                    </div>
                                    <div className="font-bold text-sm text-gray-900">
                                        {school.schoolName}
                                        <span className="ml-1.5 text-[10px] text-gray-500 font-normal">{school.region}</span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-indigo-600 text-sm bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {school.totalPoints} pt
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {tab === 'STUDENT' && currentUser && !studentData.slice(0, 30).some(u => u.isUser) && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-center relative z-10 flex flex-col items-center gap-1.5">
                    <div className="text-sm font-bold text-gray-700">
                        {myRank ? (
                            <>내 순위: <span className="text-indigo-600 font-mono">{myRank.rank}위</span> ({myRank.totalPoints} pt)</>
                        ) : (
                            <>내 순위: — ({currentUser.points || 0} pt)</>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        문제를 더 풀고 랭킹에 도전하세요!
                    </div>
                </div>
            )}
        </div>
    );
};
