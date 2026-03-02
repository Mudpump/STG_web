
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CounselingGenerator } from '../components/admin/CounselingGenerator';
import { ProfessorGenerator } from '../components/admin/ProfessorGenerator';
import { FeedGenerator } from '../components/admin/FeedGenerator';
import { RoadmapGenerator } from '../components/admin/RoadmapGenerator';
import { TrendGenerator } from '../components/admin/TrendGenerator';
import { VoteGenerator } from '../components/admin/VoteGenerator';
import { StagingArea } from '../components/admin/StagingArea';

export const AdminPage: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-black text-gray-900">관리자 대시보드</h2>
            <p className="text-gray-500 text-sm">AI 에이전트 멀티 태스킹 제어실</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* 학생 상담소 & 교수 에이전트 */}
        <CounselingGenerator />
        <ProfessorGenerator />

        {/* 탐구줍줍 & 구버전 로드맵 */}
        <FeedGenerator />
        <RoadmapGenerator />

        {/* 이슈떡상 & 토론찍먹 */}
        <TrendGenerator />
        <VoteGenerator />
      </div>

      {/* 발행 대기열 */}
      <StagingArea />
    </div>
  );
};
