
import React, { useState } from 'react';
import { VoteItem } from '../types';
import { Swords, MessageSquare, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface Props {
  item: VoteItem;
}

export const ArenaCard: React.FC<Props> = ({ item }) => {
  const navigate = useNavigate();
  const { toggleLikeVote, likedVoteIds, isAdmin, deleteVote, castVote, currentUser, openLoginModal } = useStore();
  
  const total = item.votesA + item.votesB;
  const percentA = total === 0 ? 0 : Math.round((item.votesA / total) * 100);
  const percentB = total === 0 ? 0 : 100 - percentA;
  
  const isLiked = likedVoteIds.has(item.id);

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('정말 이 토론 주제를 삭제하시겠습니까?')) {
          deleteVote(item.id);
      }
  };

  const handleVote = (e: React.MouseEvent, option: 'A' | 'B') => {
      e.stopPropagation();
      if (!currentUser) {
          openLoginModal();
          return;
      }
      castVote(item.id, option);
  };

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser) {
          openLoginModal();
          return;
      }
      toggleLikeVote(item.id);
  }

  return (
    <div 
        onClick={() => navigate(`/arena/${item.id}`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all relative group"
    >
      <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg">
            <Swords size={16} />
            <span>토론찍먹</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
                    onClick={handleLike}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    {item.likeCount || 0}
            </button>
            {isAdmin && (
                <button 
                    onClick={handleDelete}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 size={16} />
                </button>
            )}
          </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors tracking-tight">{item.title}</h3>
      <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">{item.description}</p>

      <div className="flex gap-3 mb-6">
        <button 
          onClick={(e) => handleVote(e, 'A')}
          disabled={!!item.myVote}
          className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
            item.myVote === 'A' 
            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500 shadow-sm' 
            : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 bg-white'
          }`}
        >
          <div className="text-indigo-600 font-black mb-1.5 text-lg">A</div>
          <div className="text-sm font-bold text-gray-800 leading-snug">{item.optionA}</div>
        </button>
        <button 
          onClick={(e) => handleVote(e, 'B')}
          disabled={!!item.myVote}
          className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
             item.myVote === 'B'
            ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm' 
            : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 bg-white'
          }`}
        >
          <div className="text-emerald-500 font-black mb-1.5 text-lg">B</div>
          <div className="text-sm font-bold text-gray-800 leading-snug">{item.optionB}</div>
        </button>
      </div>

      {item.myVote && (
        <div className="animation-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex mb-3">
            <div style={{ width: `${percentA}%` }} className="bg-indigo-500 h-full transition-all duration-1000"></div>
            <div style={{ width: `${percentB}%` }} className="bg-emerald-500 h-full transition-all duration-1000"></div>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-indigo-600">{percentA}% ({item.votesA}명)</span>
            <span className="text-emerald-600">{percentB}% ({item.votesB}명)</span>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center text-gray-500 text-sm gap-2 hover:text-indigo-600 font-bold transition-colors">
        <MessageSquare size={16} />
        <span>댓글 토론 {item.comments.length}개 보기</span>
      </div>
    </div>
  );
};
