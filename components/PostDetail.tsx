
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Heart, Share2, Bookmark, Send, Trash2, CornerDownRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../constants';

export const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
      posts, addComment, addPostReply, deleteComment, isAdmin,
      toggleLikePost, likedPostIds,
      toggleSavePost, savedPostIds,
      toggleLikeComment, likedCommentIds,
      currentUser, deletePost, openLoginModal, incrementViewCount,
      fetchPostComments // [NEW] Added fetchPostComments
  } = useStore();
  
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  
  const post = posts.find(p => p.id === id);

  useEffect(() => {
    if (id) {
        incrementViewCount('POST', id);
        fetchPostComments(id); // [NEW] Fetch fresh comments for this post
    }
  }, [id]);

  if (!post) {
    return <div className="p-20 text-center text-gray-500">삭제되었거나 존재하지 않는 게시글입니다.</div>;
  }

  const isLiked = likedPostIds.has(post.id);
  const isSaved = savedPostIds.has(post.id);
  const categoryName = CATEGORIES.find(c => c.id === post.categoryId)?.name || post.categoryId;
  const isProfessor = post.authorRole === 'Professor';

  const handlePostDelete = () => {
      if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
          deletePost(post.id);
          navigate('/', { replace: true });
      }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { openLoginModal(); return; }
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleReplySubmit = (parentCommentId: string | number) => {
      if (!currentUser) { openLoginModal(); return; }
      if (!replyText.trim()) return;
      addPostReply(post.id, parentCommentId, replyText);
      setReplyText('');
      setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: number | string) => {
    if (window.confirm('댓글을 삭제하시겠습니까? (답글도 함께 삭제됩니다)')) {
      deleteComment(post.id, commentId);
    }
  };

  const canDeletePost = isAdmin || (currentUser && post.isUser && post.uid === currentUser.uid);

  return (
    <div className="bg-white min-h-screen relative pb-20 max-w-4xl mx-auto md:shadow-xl md:mt-2 md:mb-6 md:rounded-2xl md:min-h-[600px]">
      {/* Sticky Header - Adjusted top-16 for desktop to account for main header */}
      <div className="sticky top-0 md:top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 h-12 flex items-center px-4 justify-between md:rounded-t-2xl">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-gray-800" />
            </button>
            <span className="ml-2 font-bold text-gray-900">
                {isProfessor ? '연구실 게시판' : categoryName}
            </span>
        </div>
        
        {/* Post Delete Button */}
        {canDeletePost && (
            <button 
                onClick={handlePostDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <Trash2 size={20} />
            </button>
        )}
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm overflow-hidden
            ${post.isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {post.isUser ? '🧑‍🎓' : post.authorRole === 'Professor' ? '👨‍🏫' : '🤖'}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
                {post.isUser ? '나 (학생)' : post.authorAgent}
            </div>
            <div className="text-xs text-gray-400 font-medium">{post.createdAt} · 조회 {post.viewCount}</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-snug tracking-tight">
          {post.title}
        </h1>

        <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-6 text-lg font-normal">
          {post.content}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 border-y border-gray-100 py-3">
            <button 
                onClick={() => currentUser ? toggleLikePost(post.id) : openLoginModal()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    isLiked 
                    ? 'bg-primary text-white' 
                    : 'text-primary bg-primary-soft hover:bg-primary/20'
                }`}
            >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                좋아요 {post.likeCount}
            </button>
            <button 
                onClick={() => currentUser ? toggleSavePost(post.id) : openLoginModal()}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    isSaved
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? '저장됨' : '저장'}
            </button>
            <button className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      <div className="bg-gray-50/50 px-6 py-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-1.5">
          댓글 <span className="text-primary">{post.comments.length}</span>
        </h3>
        
        <div className="space-y-4 mb-20">
          {post.comments.map((comment) => {
             const commentKey = `POST-${post.id}-${comment.id}`;
             const isCommentLiked = likedCommentIds.has(commentKey);
             const isAuthor = post.isUser ? comment.isUser : comment.agentName === post.authorAgent;
             // Can delete if Admin OR (User wrote comment)
             const canDeleteComment = isAdmin || (currentUser && comment.isUser && comment.uid === currentUser.uid);

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
                                {isAuthor && <span className="text-primary ml-1 text-xs">(작성자)</span>}
                            </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => currentUser ? toggleLikeComment('POST', post.id, comment.id) : openLoginModal()}
                                    className={`text-xs flex items-center gap-1 transition-colors ${
                                        isCommentLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                <Heart size={14} fill={isCommentLiked ? "currentColor" : "none"} /> {comment.likes}
                                </button>
                                {canDeleteComment && (
                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-300 hover:text-red-500">
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-base text-gray-700 leading-relaxed font-medium">
                            {comment.text}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-medium">{comment.createdAt}</span>
                            <button 
                                onClick={() => {
                                    if(!currentUser) { openLoginModal(); return; }
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
                                 const replyKey = `POST-${post.id}-${reply.id}`;
                                 const isReplyLiked = likedCommentIds.has(replyKey);
                                 const canDeleteReply = isAdmin || (currentUser && reply.isUser && reply.uid === currentUser.uid);
                                 
                                 return (
                                     <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                         <div className="flex justify-between items-start mb-1">
                                             <span className="font-bold text-xs text-gray-800 flex items-center gap-1">
                                                 {reply.agentName}
                                                 {reply.isUser && <span className="text-[10px] bg-primary text-white px-1 rounded">나</span>}
                                             </span>
                                              <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => currentUser ? toggleLikeComment('POST', post.id, reply.id) : openLoginModal()}
                                                    className={`text-xs flex items-center gap-1 transition-colors ${
                                                        isReplyLiked ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                <Heart size={12} fill={isReplyLiked ? "currentColor" : "none"} /> {reply.likes}
                                                </button>
                                                {canDeleteReply && (
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
                    placeholder="세특 꿀팁에 대해 의견을 남겨주세요 🧐" 
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
