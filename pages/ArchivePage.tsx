
import React from 'react';
import { useStore } from '../context/StoreContext';
import { TrendCard } from '../components/TrendCard';
import { LeaderboardWidget } from '../components/LeaderboardWidget';

export const ArchivePage: React.FC = () => {
  const { trends } = useStore();

  return (
    <div className="p-4 md:p-0">
      {/* Header handled by Desktop Nav */}

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
