
import React from 'react';
import { TrendItem } from '../types';
import { ArrowRight, Heart, Trash2 } from 'lucide-react'; // Heart Icon
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface Props {
  item: TrendItem;
}

export const TrendCard: React.FC<Props> = ({ item }) => {
  const navigate = useNavigate();
  const { likedTrendIds, isAdmin, deleteTrend } = useStore();
  const isLiked = likedTrendIds.has(item.id);

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('정말 이 이슈떡상 게시물을 삭제하시겠습니까?')) {
          deleteTrend(item.id);
      }
  };

  return (
    <div 
        onClick={() => navigate(`/archive/${item.id}`)}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 flex flex-col h-full group cursor-pointer hover:shadow-md hover:border-gray-300 transition-all relative"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/20">
            {item.targetMajor}
        </div>
      </div>
      
      {isAdmin && (
          <button 
            onClick={handleDelete}
            className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 rounded-full transition-colors z-20 shadow-sm"
          >
            <Trash2 size={14} />
          </button>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">#{item.keyword}</div>
            <div className={`flex items-center gap-1 text-xs font-bold ${isLiked ? 'text-rose-500' : 'text-gray-400'}`}>
                <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                {item.likeCount}
            </div>
        </div>
        <h3 className="font-bold text-gray-900 leading-snug mb-3 text-lg group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h3>
        <ul className="text-sm text-gray-500 space-y-2 mb-5 flex-1">
          {item.summary.map((line, i) => (
            <li key={i} className="flex gap-2 items-start">
               <span className="text-indigo-400 mt-1 text-[10px]">●</span> 
               <span className="line-clamp-2 leading-relaxed font-medium">{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
             <span>{item.createdAt}</span>
             <div className="flex items-center gap-1 text-gray-900 font-bold group-hover:translate-x-1 transition-transform">
                <span>보러가기</span>
                <ArrowRight size={14} />
             </div>
        </div>
      </div>
    </div>
  );
};
