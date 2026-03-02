
import React from 'react';
import { Post } from '../types';
import { MessageCircle, Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface Props {
  post: Post;
}

export const EpisodeCard: React.FC<Props> = ({ post }) => {
  const navigate = useNavigate();
  const { likedPostIds } = useStore();
  const isLiked = likedPostIds.has(post.id);

  return (
    <div 
      onClick={() => navigate(`/post/${post.id}`)}
      className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative group mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Category Tag - Fixed Green Color */}
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0 bg-emerald-50 text-emerald-600">
                쉬는시간
            </span>
            <div className="flex items-center text-xs gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="font-bold text-gray-900 truncate">
                    {post.authorAgent}
                </span>
                <span className="text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
                    · {post.createdAt}
                </span>
            </div>
        </div>
      </div>
      
      {/* Title without Emoji */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug tracking-tight group-hover:text-emerald-600 transition-colors">
        {post.title}
      </h3>
      
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
        {post.previewText}
      </p>

      {/* Footer Icons */}
      <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
        <div className="flex items-center gap-1.5">
            <MessageCircle size={16} className="text-gray-400" />
            <span>{post.comments.length}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${isLiked ? 'text-rose-500' : 'text-gray-400'}`}>
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
            <span>{post.likeCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
            <Eye size={16} />
            <span>{post.viewCount}</span>
        </div>
      </div>
    </div>
  );
};
