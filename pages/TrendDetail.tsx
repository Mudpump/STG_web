
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Send, Trash2, Lightbulb, CornerDownRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { QuizSection } from '../components/QuizSection';

export const TrendDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
      trends, addTrendComment, addTrendReply, deleteTrendComment, isAdmin,
      toggleLikeTrend, likedTrendIds,
      toggleLikeComment, likedCommentIds, deleteTrend, currentUser, openLoginModal, incrementViewCount
  } = useStore();
  
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);

  const trend = trends.find(t => t.id === id);

  useEffect(() => {
    if (id) {
        incrementViewCount('TREND', id);
    }
  }, [id]);

  if (!trend) {
    return <div className="p-20 text-center text-gray-500">자료를 찾을 수 없습니다.</div>;
  }

  const isLiked = likedTrendIds.has(trend.id);

  const handleTrendDelete = () => {
    if (window.confirm('정말 이 이슈떡상 게시물을 삭제하시겠습니까?')) {
        deleteTrend(trend.id);
        navigate('/archive', { replace: true });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { openLoginModal(); return; }
    if (!commentText.trim()) return;
    addTrendComment(trend.id, commentText);
    setCommentText('');
  };

  const handleReplySubmit = (parentCommentId: string | number) => {
    if (!currentUser) { openLoginModal(); return; }
    if (!replyText.trim()) return;
    addTrendReply(trend.id, parentCommentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: number | string) => {
    if (window.confirm('댓글을 삭제하시겠습니까? (답글도 함께 삭제됩니다)')) {
      deleteTrendComment(trend.id, commentId);
    }
  };

  return (
    <div className="bg-white min-h-screen relative pb-20 max-w-4xl mx-auto md:shadow-xl md:mt-2 md:mb-6 md:rounded-2xl md:min-h-[600px] overflow-hidden">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={trend.imageUrl} alt={trend.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <div>
                <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-md mb-2 inline-block">
                    {trend.targetMajor}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    {trend.title}
                </h1>
            </div>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
            <ArrowLeft size={24} />
        </button>

        {isAdmin && (
            <button 
                onClick={handleTrendDelete}
                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
            >
                <Trash2 size={20} />
            </button>
        )}
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span>AI 리포트</span>
            <span>·</span>
            <span>{trend.createdAt}</span>
            <span>·</span>
            <span>조회 {trend.viewCount}</span>
        </div>

        <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-l-4 border-gray-900 pl-3">
                3분 요약: 이게 뭔데?
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-5 rounded-xl border border-gray-100 text-[15px]">
                {trend.content}
            </div>
        </div>
        
        {/* NEW: Quiz Section */}
        {trend.quizzes && trend.quizzes.length > 0 && (
            <QuizSection quizzes={trend.quizzes} trendId={trend.id} />
        )}

        <div className="mb-6 mt-6">
            <h2 className="text-lg font-bold text-primary mb-2 border-l-4 border-primary pl-3 flex items-center gap-2">
                세특 연결 고리
                <Lightbulb size={20} className="text-primary" fill="currentColor" />
            </h2>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line bg-primary-soft/30 p-5 rounded-xl border border-primary/20 shadow-sm text-[15px]">
                {trend.seTeukTip}
            </div>
        </div>

        <div className="flex gap-2 mb-6">
             <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium">#{trend.keyword}</span>
        </div>

        <div className="flex items-center gap-3 border-y border-gray-100 py-3">
            <button 
                onClick={() => currentUser ? toggleLikeTrend(trend.id) : openLoginModal()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isLiked 
                    ? 'bg-primary text-white' 
                    : 'text-primary bg-primary-soft hover:bg-primary/20'
                }`}
            >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                좋아요 {trend.likeCount}
            </button>
            <button 
                onClick={() => !currentUser ? openLoginModal() : alert('준비중입니다')}
                className="flex items-center gap-1.5 text-gray-500 px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors"
            >
                <Bookmark size={18} />
                저장
            </button>
        </div>
      </div>

      <div className="bg-gray-50/50 px-6 py-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1.5">
          댓글 <span className="text-primary">{trend.comments.length}</span>
        </h3>
        
        <div className="space-y-4 mb-20">
          {trend.comments.map((comment) => {
            const commentKey = `TREND-${trend.id}-${comment.id}`;
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
                                    onClick={() => currentUser ? toggleLikeComment('TREND', trend.id, comment.id) : openLoginModal()}
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
                                 const replyKey = `TREND-${trend.id}-${reply.id}`;
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
                                                    onClick={() => currentUser ? toggleLikeComment('TREND', trend.id, reply.id) : openLoginModal()}
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
      
      <div className="bg-white border-t border-gray-100 p-3 fixed bottom-0 left-0 right-0 md:absolute md:bottom-0 md:left-0 md:right-0 z-50 pb-safe-bottom md:rounded-b-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
            <form onSubmit={handleCommentSubmit} className="flex-1 flex gap-2 relative">
                <input 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="내용이 도움이 되었나요? 댓글을 남겨주세요." 
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
