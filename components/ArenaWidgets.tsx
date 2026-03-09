import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Flame, Trophy, MessageCircle, Heart } from 'lucide-react';

export const ArenaHotMatchWidget = () => {
    const { votes } = useStore();
    const navigate = useNavigate();

    // 상위 3개 토론 추출 (참여도가 가장 높은 순: 총 투표수 + 좋아요 수)
    const hotMatches = [...votes]
        .sort((a, b) => {
            const scoreA = (a.votesA + a.votesB) + a.likeCount;
            const scoreB = (b.votesB + b.votesB) + b.likeCount;
            return scoreB - scoreA;
        })
        .slice(0, 3);

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-4">
                <Flame size={18} className="text-rose-500" />
                실시간 박빙 매치
            </h4>

            <div className="space-y-4">
                {hotMatches.map((vote, index) => {
                    const totalVotes = vote.votesA + vote.votesB;
                    return (
                        <div
                            key={vote.id}
                            onClick={() => navigate(`/arena/${vote.id}`)}
                            className="flex gap-3 items-start group cursor-pointer"
                        >
                            <div className="font-black text-gray-300 text-lg leading-none mt-1 group-hover:text-primary transition-colors">
                                {index + 1}
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
                                    {vote.title}
                                </h5>
                                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 opacity-80" /> 투표 {totalVotes}</span>
                                    <span className="flex items-center gap-1"><MessageCircle size={10} /> {vote.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const ArenaBestCommentWidget = () => {
    const { votes } = useStore();
    const navigate = useNavigate();

    // 가장 좋아요가 많은 댓글 1개 추출
    let bestComment: any = null;
    let parentVoteId = '';
    let parentVoteTitle = '';

    votes.forEach(vote => {
        vote.comments?.forEach(comment => {
            if (!bestComment || comment.likes > bestComment.likes) {
                bestComment = comment;
                parentVoteId = vote.id;
                parentVoteTitle = vote.title;
            }
            // 대댓글도 순회 확인 
            comment.replies?.forEach(reply => {
                if (!bestComment || reply.likes > bestComment.likes) {
                    bestComment = reply;
                    parentVoteId = vote.id;
                    parentVoteTitle = vote.title;
                }
            })
        });
    });

    if (!bestComment) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Trophy size={48} className="text-indigo-600" />
            </div>

            <h3 className="font-bold text-indigo-900 mb-4 text-sm flex items-center gap-1.5 relative z-10">
                <Trophy size={16} className="text-indigo-600" />
                이주의 베스트 논객
            </h3>

            <div
                className="relative z-10 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm cursor-pointer hover:shadow-md transition-all group"
                onClick={() => navigate(`/arena/${parentVoteId}`)}
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] overflow-hidden">
                        🤓
                    </div>
                    <span className="text-xs font-bold text-gray-900">{bestComment.agentName}</span>
                </div>

                <p className="text-sm font-medium text-gray-700 leading-relaxed line-clamp-3 mb-3">
                    "{bestComment.text}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px] group-hover:text-indigo-500 transition-colors">
                        원문: {parentVoteTitle}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
                        <Heart size={10} fill="currentColor" /> {bestComment.likes}
                    </div>
                </div>
            </div>
        </div>
    );
};
