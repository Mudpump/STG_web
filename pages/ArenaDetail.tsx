
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Swords, Send, Heart, Trash2, Share2, CornerDownRight, Users, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ArenaDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        votes, addVoteComment, addVoteReply, deleteVoteComment, isAdmin,
        toggleLikeComment, likedCommentIds,
        toggleLikeVote, likedVoteIds, deleteVote, castVote, currentUser, openLoginModal
    } = useStore();

    // Removed local voted state
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | number | null>(null);

    // 상태
    const [isLiking, setIsLiking] = useState(false);

    const voteItem = votes.find(v => v.id === id);

    if (!voteItem) {
        return <div className="p-20 text-center text-gray-500">토론을 찾을 수 없습니다.</div>;
    }

    const total = voteItem.votesA + voteItem.votesB;
    const percentA = total === 0 ? 0 : Math.round((voteItem.votesA / total) * 100);
    const percentB = total === 0 ? 0 : 100 - percentA;
    const isLiked = likedVoteIds.has(voteItem.id);

    const handleVoteDelete = () => {
        if (window.confirm('정말 이 토론 주제를 삭제하시겠습니까?')) {
            deleteVote(voteItem.id);
            navigate('/arena', { replace: true });
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) { openLoginModal(); return; }
        if (!commentText.trim()) return;
        addVoteComment(voteItem.id, commentText);
        setCommentText('');
    };

    const handleReplySubmit = (parentCommentId: string | number) => {
        if (!currentUser) { openLoginModal(); return; }
        if (!replyText.trim()) return;
        addVoteReply(voteItem.id, parentCommentId, replyText);
        setReplyText('');
        setReplyingTo(null);
    };

    const handleDeleteComment = (commentId: number | string) => {
        if (window.confirm('댓글을 삭제하시겠습니까? (답글도 함께 삭제됩니다)')) {
            deleteVoteComment(voteItem.id, commentId);
        }
    };

    const handleVoteClick = (option: 'A' | 'B') => {
        if (!currentUser) { openLoginModal(); return; }
        if (voteItem.myVote === option) return; // Prevent same vote
        castVote(voteItem.id, option);
    };

    const handleLikeClick = () => {
        if (!currentUser) { openLoginModal(); return; }
        setIsLiking(true);
        setTimeout(() => setIsLiking(false), 200);
        toggleLikeVote(voteItem.id);
    };

    const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

    return (
        <div className="bg-white min-h-screen relative pb-20 max-w-4xl mx-auto md:shadow-xl md:mt-2 md:mb-6 md:rounded-2xl md:min-h-[600px] overflow-hidden">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 h-12 flex items-center px-4 justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowLeft size={22} className="text-gray-800" />
                    </button>
                    <span className="ml-2 font-bold text-gray-900 flex items-center gap-1">
                        <Swords size={16} className="text-primary" />
                        토론찍먹
                    </span>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleVoteDelete}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <div className="px-6 pt-4 pb-6">
                <h1 className="text-[24px] font-black text-gray-900 mb-3 tracking-tight leading-snug">{voteItem.title}</h1>
                <p className="text-[16px] text-[#222222] leading-relaxed mb-6 font-medium">{voteItem.description}</p>

                {/* 투표 선택 영역 */}
                <div className="mb-8">
                    {!voteItem.myVote ? (
                        // 미투표 상태
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVoteClick('A')}
                                className="flex-[1] p-5 rounded-2xl border border-gray-200 hover:border-violet-500 hover:bg-violet-50 bg-white transition-all text-left flex flex-col justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-violet-500 font-black text-2xl font-[Jua,sans-serif]">A</span>
                                </div>
                                <div className="text-[16px] font-bold text-gray-800 leading-snug">{voteItem.optionA}</div>
                            </button>
                            <button
                                onClick={() => handleVoteClick('B')}
                                className="flex-[1] p-5 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white transition-all text-left flex flex-col justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-500 font-black text-2xl font-[Jua,sans-serif]">B</span>
                                </div>
                                <div className="text-[16px] font-bold text-gray-800 leading-snug">{voteItem.optionB}</div>
                            </button>
                        </div>
                    ) : (
                        // 투표 완료 상태 (A/B 자유 변경 가능)
                        <div className="flex flex-col gap-3">
                            {/* 옵션 A Progress Bar */}
                            <div className="flex items-center gap-3">
                                <div className="w-5 flex justify-center flex-shrink-0">
                                    {voteItem.myVote === 'A' && <CheckCircle2 size={24} fill="#8B5CF6" stroke="white" />}
                                </div>
                                <div
                                    onClick={() => handleVoteClick('A')}
                                    className="relative flex-1 h-[54px] rounded-xl overflow-hidden cursor-pointer bg-[#F8F9FA] transition-all"
                                >
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#EDE9FE] transition-all duration-500 ease-out"
                                        style={{ width: `${percentA}%` }}
                                    />
                                    <div className="absolute inset-0 px-4 flex justify-between items-center z-10">
                                        <span className="text-[15px] font-bold text-gray-800 truncate mr-4">
                                            A. {voteItem.optionA}
                                        </span>
                                        <span className="text-[16px] font-bold text-violet-600 flex-shrink-0">
                                            {percentA}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 옵션 B Progress Bar */}
                            <div className="flex items-center gap-3">
                                <div className="w-5 flex justify-center flex-shrink-0">
                                    {voteItem.myVote === 'B' && <CheckCircle2 size={24} fill="#3B82F6" stroke="white" />}
                                </div>
                                <div
                                    onClick={() => handleVoteClick('B')}
                                    className="relative flex-1 h-[54px] rounded-xl overflow-hidden cursor-pointer bg-[#F8F9FA] transition-all"
                                >
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#DBEAFE] transition-all duration-500 ease-out"
                                        style={{ width: `${percentB}%` }}
                                    />
                                    <div className="absolute inset-0 px-4 flex justify-between items-center z-10">
                                        <span className="text-[15px] font-bold text-gray-800 truncate mr-4">
                                            B. {voteItem.optionB}
                                        </span>
                                        <span className="text-[16px] font-bold text-blue-600 flex-shrink-0">
                                            {percentB}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Activity Bar */}
                <div className="flex items-center pt-4 border-t border-gray-100 gap-5 text-slate-400">
                    <div className="flex items-center gap-2">
                        <MessageCircle size={18} strokeWidth={2} />
                        <span className="text-[15px] font-bold">{voteItem.comments.length}</span>
                    </div>
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-2 transition-all ${isLiked
                            ? 'text-rose-500'
                            : 'hover:text-slate-600'
                            } ${isLiking ? 'scale-125' : 'active:scale-95'}`}
                    >
                        <Heart size={18} strokeWidth={2} fill={isLiked ? "currentColor" : "none"} className={isLiking ? 'animate-bounce' : ''} />
                        <span className="text-[15px] font-bold">{voteItem.likeCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <Users size={18} strokeWidth={2} />
                        <span className="text-[15px] font-bold">{formatNumber(total)}</span>
                    </div>
                    <button className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors active:scale-95">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50/50 px-6 py-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                    토론 댓글 <span className="text-primary">{voteItem.comments.length}</span>
                </h3>

                <div className="space-y-4 mb-20">
                    {voteItem.comments.map((comment) => {
                        const commentKey = `VOTE-${voteItem.id}-${comment.id}`;
                        const isCommentLiked = likedCommentIds.has(commentKey);

                        return (
                            <div key={comment.id} className="group">
                                {/* Main Comment */}
                                <div className={`p-4 rounded-xl shadow-sm border relative ${comment.isUser
                                    ? 'bg-primary-soft/30 border-primary/10'
                                    : 'bg-white border-gray-100'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900">
                                                {comment.agentName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => currentUser ? toggleLikeComment('VOTE', voteItem.id, comment.id) : openLoginModal()}
                                                className={`text-xs flex items-center gap-1 transition-colors ${isCommentLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                <Heart size={14} fill={isCommentLiked ? "currentColor" : "none"} /> {comment.likes}
                                            </button>
                                            {isAdmin && (
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-300 hover:text-red-500">
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {comment.text}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <span className="text-[10px] text-gray-400 font-medium">{comment.createdAt}</span>
                                        <button
                                            onClick={() => {
                                                if (!currentUser) { openLoginModal(); return; }
                                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                            }}
                                            className="text-xs text-gray-400 font-bold hover:text-primary transition-colors"
                                        >
                                            답글
                                        </button>
                                    </div>
                                </div>

                                {/* Reply Input Form */}
                                {replyingTo === comment.id && (
                                    <div className="ml-6 mt-2 flex items-center gap-2 animation-fade-in">
                                        <CornerDownRight size={16} className="text-gray-300" />
                                        <div className="flex-1 flex gap-2 relative">
                                            <input
                                                autoFocus
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="답글 작성..."
                                                className="flex-1 bg-white border border-gray-200 text-xs py-2 pl-3 pr-10 rounded-lg outline-none focus:border-primary transition-all"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleReplySubmit(comment.id); }}
                                            />
                                            <button
                                                onClick={() => handleReplySubmit(comment.id)}
                                                disabled={!replyText.trim()}
                                                className="absolute right-1 top-1 p-1 bg-primary text-white rounded-md disabled:opacity-50"
                                            >
                                                <Send size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Nested Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-6 space-y-2 mt-2 border-l-2 border-gray-100 pl-4">
                                        {comment.replies.map((reply) => {
                                            const replyKey = `VOTE-${voteItem.id}-${reply.id}`;
                                            const isReplyLiked = likedCommentIds.has(replyKey);

                                            return (
                                                <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-xs text-gray-800 flex items-center gap-1">
                                                            {reply.agentName}
                                                            {reply.isUser && <span className="text-[10px] bg-primary text-white px-1 rounded">나</span>}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => currentUser ? toggleLikeComment('VOTE', voteItem.id, reply.id) : openLoginModal()}
                                                                className={`text-xs flex items-center gap-1 transition-colors ${isReplyLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                                                    }`}
                                                            >
                                                                <Heart size={12} fill={isReplyLiked ? "currentColor" : "none"} /> {reply.likes}
                                                            </button>
                                                            {isAdmin && (
                                                                <button onClick={() => handleDeleteComment(reply.id)} className="text-gray-300 hover:text-red-500">
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{reply.text}</p>
                                                    <div className="mt-1 text-[10px] text-gray-400">{reply.createdAt}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-3 fixed bottom-0 left-0 right-0 md:absolute md:bottom-0 md:left-0 md:right-0 z-50 pb-safe-bottom md:rounded-b-2xl">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <form onSubmit={handleCommentSubmit} className="flex-1 flex gap-2 relative">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="당신의 의견을 들려주세요 (매너 채팅!)"
                            className="flex-1 bg-gray-100 text-sm py-3 pl-4 pr-12 rounded-full outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="absolute right-2 top-1.5 p-1.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-all hover:bg-primary-dark"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
