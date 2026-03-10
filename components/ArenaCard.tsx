
import React, { useState } from 'react';
import { VoteItem } from '../types';
import { Swords, MessageCircle, Heart, Trash2, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface Props {
  item: VoteItem;
}

export const ArenaCard: React.FC<Props> = ({ item }) => {
  const navigate = useNavigate();
  const { toggleLikeVote, likedVoteIds, isAdmin, deleteVote, castVote, currentUser, openLoginModal } = useStore();

  // 상태
  const [isLiking, setIsLiking] = useState(false);

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
    // Allow switching votes
    if (item.myVote === option) return;
    castVote(item.id, option);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      openLoginModal();
      return;
    }
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 200);
    toggleLikeVote(item.id);
  }

  // Activity Bar Formatting
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  return (
    <div
      onClick={() => navigate(`/arena/${item.id}`)}
      className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-6 mb-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all relative group"
    >
      {isAdmin && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <h3 className={`text-[22px] font-bold text-gray-900 mb-3 leading-snug group-hover:text-violet-600 transition-colors tracking-tight font-sans ${!isAdmin ? 'mt-2' : ''}`}>{item.title}</h3>
      <p className="text-[15px] text-gray-600 mb-5 line-clamp-2 leading-relaxed font-medium">{item.description}</p>

      {/* Vote Area Section */}
      <div className="mb-6">
        {!item.myVote ? (
          // [미투표 상태] 나란히 배치되는 A/B 버튼
          <div className="flex gap-3">
            <button
              onClick={(e) => handleVote(e, 'A')}
              className="flex-[1] p-5 rounded-xl border border-gray-200 hover:border-violet-500 hover:bg-violet-50 bg-white transition-all text-left flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-violet-500 font-black text-2xl font-[Jua,sans-serif]">A</span>
              </div>
              <div className="text-[15px] font-bold text-gray-800 leading-snug">{item.optionA}</div>
            </button>
            <button
              onClick={(e) => handleVote(e, 'B')}
              className="flex-[1] p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white transition-all text-left flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 font-black text-2xl font-[Jua,sans-serif]">B</span>
              </div>
              <div className="text-[15px] font-bold text-gray-800 leading-snug">{item.optionB}</div>
            </button>
          </div>
        ) : (
          // [투표 후 상태] Progress Bar 스타일의 리스트 (클릭 시 A/B 변경 지원)
          <div className="flex flex-col gap-2.5">
            {/* 옵션 A Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="w-5 flex justify-center flex-shrink-0">
                {item.myVote === 'A' && <CheckCircle2 size={24} fill="#8B5CF6" stroke="white" />}
              </div>
              <div
                onClick={(e) => handleVote(e, 'A')}
                className="relative flex-1 h-[48px] rounded-xl overflow-hidden cursor-pointer bg-[#F8F9FA] transition-all"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-[#EDE9FE] transition-all duration-500 ease-out"
                  style={{ width: `${percentA}%` }}
                />
                <div className="absolute inset-0 px-4 flex justify-between items-center z-10">
                  <span className="text-[15px] font-bold text-gray-800 truncate mr-4">
                    A. {item.optionA}
                  </span>
                  <span className="text-[15px] font-bold text-violet-600 flex-shrink-0">
                    {percentA}%
                  </span>
                </div>
              </div>
            </div>

            {/* 옵션 B Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="w-5 flex justify-center flex-shrink-0">
                {item.myVote === 'B' && <CheckCircle2 size={24} fill="#3B82F6" stroke="white" />}
              </div>
              <div
                onClick={(e) => handleVote(e, 'B')}
                className="relative flex-1 h-[48px] rounded-xl overflow-hidden cursor-pointer bg-[#F8F9FA] transition-all"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-[#DBEAFE] transition-all duration-500 ease-out"
                  style={{ width: `${percentB}%` }}
                />
                <div className="absolute inset-0 px-4 flex justify-between items-center z-10">
                  <span className="text-[15px] font-bold text-gray-800 truncate mr-4">
                    B. {item.optionB}
                  </span>
                  <span className="text-[15px] font-bold text-blue-600 flex-shrink-0">
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
          <span className="text-[15px] font-bold">{item.commentCount ?? item.comments.length}</span>
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all ${isLiked ? 'text-rose-500' : 'hover:text-slate-600'
            } ${isLiking ? 'scale-125' : 'active:scale-95'}`}
        >
          <Heart size={18} strokeWidth={2} fill={isLiked ? "currentColor" : "none"} className={isLiking ? 'animate-bounce' : ''} />
          <span className="text-[15px] font-bold">{item.likeCount || 0}</span>
        </button>
        <div className="flex items-center gap-2">
          <Users size={18} strokeWidth={2} />
          <span className="text-[15px] font-bold">{formatNumber(total)}</span>
        </div>
      </div>
    </div>
  );
};
