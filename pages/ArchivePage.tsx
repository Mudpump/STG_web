
import React from 'react';
import { useStore } from '../context/StoreContext';
import { TrendCard } from '../components/TrendCard';
import { LeaderboardWidget } from '../components/LeaderboardWidget';

export const ArchivePage: React.FC = () => {
  const { trends } = useStore();

  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-1">이슈떡상</h2>
        <p className="text-sm text-gray-500">수행평가 주제가 떠오르지 않을 때 찾는 보물창고</p>
      </div>

      {/* Leaderboard Section */}
      <LeaderboardWidget />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {trends.map(item => (
            <TrendCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
