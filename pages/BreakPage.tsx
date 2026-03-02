
import React from 'react';
import { useStore } from '../context/StoreContext';
import { EpisodeCard } from '../components/EpisodeCard';
import { Coffee } from 'lucide-react';

export const BreakPage: React.FC = () => {
  const { posts } = useStore();
  
  // Filter only BREAK posts
  const breakPosts = posts.filter(p => p.categoryId === 'BREAK');

  return (
    <div className="p-4 md:p-0 pb-20">
       <div className="mb-6 pl-1">
        <div className="flex items-center gap-2 mb-2">
            <Coffee className="text-amber-500" size={28} strokeWidth={2.5} />
            <h2 className="text-2xl font-black text-gray-900">쉬는시간</h2>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          공부하다 지칠 때, 뇌 빼고 웃고 가는<br className="md:hidden"/>
          <span className="font-bold text-gray-800"> 우리들의 공감 대나무숲</span>
        </p>
      </div>

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {breakPosts.map(post => (
             <EpisodeCard key={post.id} post={post} />
        ))}
        {breakPosts.length === 0 && (
            <div className="p-20 text-center text-gray-400 col-span-2">
                아직 쉬는시간 글이 없어요. <br/>관리자가 열심히 썰 푸는 중... ✍️
            </div>
        )}
      </div>
    </div>
  );
};
