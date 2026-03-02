
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Swords, Send, Heart, Trash2, Share2, CornerDownRight } from 'lucide-react';
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
      castVote(voteItem.id, option);
  };

  return (
    <div className="bg-white min-h-screen relative pb-20 max-w-4xl mx-auto md:shadow-xl md:mt-2 md:mb-6 md:rounded-2xl md:min-h-[600px] overflow-hidden">
       {/* Top Bar */}
       <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 h-12 flex items-center px-4 justify-between">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-gray-800" />
            </button>
            <span className="ml-2 font-bold text-gray-900 flex items-center gap-1">
                <Swords size={16} className="text-primary"/>
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
          <h1 className="text-2xl font-black text-gray-900 mb-2">{voteItem.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-6">{voteItem.description}</p>

          <div className="flex gap-3 mb-6">
            <button 
            onClick={() => handleVoteClick('A')}
            disabled={!!voteItem.myVote}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all ${
                voteItem.myVote === 'A' 
                ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
            }`}
            >
            <div className="text-primary font-black mb-1 text-lg">A</div>
            <div className="text-base font-bold text-gray-800">{voteItem.optionA}</div>
            </button>
            <button 
            onClick={() => handleVoteClick('B')}
            disabled={!!voteItem.myVote}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all ${
                voteItem.myVote === 'B'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
            }`}
            >
            <div className="text-blue-500 font-black mb-1 text-lg">B</div>
            <div className="text-base font-bold text-gray-800">{voteItem.optionB}</div>
            </button>
        </div>

        {voteItem.myVote && (
            <div className="animation-fade-in mb-8 bg-gray-50 p-4 rounded-xl">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex mb-2">
                <div style={{ width: `${percentA}%` }} className="bg-primary h-full transition-all duration-1000 flex items-center justify-center text-[10px] text-white font-bold"></div>
                <div style={{ width: `${percentB}%` }} className="bg-blue-500 h-full transition-all duration-1000 flex items-center justify-center text-[10px] text-white font-bold"></div>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-600">
                <span className="text-primary">{percentA}% ({voteItem.votesA}명)</span>
                <span className="text-blue-500">{percentB}% ({voteItem.votesB}명)</span>
            </div>
            </div>
        )}

        <div className="flex items-center gap-3 border-y border-gray-100 py-3">
            <button 
                onClick={() => currentUser ? toggleLikeVote(voteItem.id) : openLoginModal()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isLiked 
                    ? 'bg-primary text-white' 
                    : 'text-primary bg-primary-soft hover:bg-primary/20'
                }`}
            >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                좋아요 {voteItem.likeCount || 0}
            </button>
            <button className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
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
                    <div className={`p-4 rounded-xl shadow-sm border relative ${
                        comment.isUser 
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
                                    className={`text-xs flex items-center gap-1 transition-colors ${
                                        isCommentLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
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
                                    onKeyDown={(e) => { if(e.key === 'Enter') handleReplySubmit(comment.id); }}
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
                                                    className={`text-xs flex items-center gap-1 transition-colors ${
                                                        isReplyLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
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
