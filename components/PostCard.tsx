
import React from 'react';
import { Post } from '../types';
import { MessageCircle, Heart, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../constants';

interface Props {
  post: Post;
}

export const PostCard: React.FC<Props> = ({ post }) => {
  const navigate = useNavigate();
  const { deletePost, isAdmin, likedPostIds, currentUser } = useStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      deletePost(post.id);
    }
  };

  // Helper to get Korean Category Name
  const categoryName = CATEGORIES.find(c => c.id === post.categoryId)?.name || post.categoryId;
  const isLiked = likedPostIds.has(post.id);
  const authorName = post.authorAgent;

  // Check if current user can delete the post (Admin or Owner)
  const canDelete = isAdmin || (currentUser && post.isUser && post.uid === currentUser.uid);

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="bg-white p-5 md:p-6 border-b md:border md:rounded-2xl border-gray-200/60 active:bg-gray-50 md:hover:border-gray-300 md:hover:shadow-md transition-all cursor-pointer relative group mb-0 md:mb-4 w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Category Tag */}
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0">
            {categoryName}
          </span>
          <div className="flex items-center text-xs gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-bold text-gray-900 truncate">
              {authorName}
            </span>
            <span className="text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
              · {post.createdAt}
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors truncate tracking-tight">
        {post.title}
      </h3>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
        {post.previewText}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-500 transition-colors">
            <MessageCircle size={16} className="text-gray-400" />
            <span>{post.commentCount ?? post.comments.length}</span>
          </div>
          <div className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400'}`}>
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Eye size={16} />
            <span>{post.viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
