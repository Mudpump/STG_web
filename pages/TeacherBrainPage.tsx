
import React from 'react';
import { Brain, Bot, Target, Lightbulb, ChevronRight, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherBrainPage: React.FC = () => {
  const navigate = useNavigate();

  // 하단 그리드에 들어갈 전략 카드 데이터
  const strategies = [
    {
      id: '6-pillars',
      icon: <Scale size={24} className="text-white" />,
      color: 'bg-emerald-500',
      title: '세특의 6가지 절대 법칙',
      desc: '문과생에게 실험하라고? No. 전공별로 통하는 탐구 공식(DMS, HRC 등)은 따로 있습니다.',
      tags: ['합격공식', '프레임워크', '전공적합성']
    },
    {
      id: 'ai-teacher',
      icon: <Bot size={24} className="text-white" />,
      color: 'bg-indigo-500',
      title: '쌤 : 세특, 요즘 이렇게 쓴다',
      desc: '쌤들도 바쁩니다. AI가 생기부를 작성하는 시대, 너희 교과쌤은 어떻게 AI 적용할지 늘 생각해봐',
      tags: ['AI활용', '선생님공략', '작성효율']
    },
    {
      id: 'our-strategy',
      icon: <Target size={24} className="text-white" />,
      color: 'bg-rose-500',
      title: '학생 : 우린, 이렇게 쓰면되네',
      desc: '쌤이 세특을 잘 적을 수 있도록 좋은 먹잇감을 최대한 많이 던져서, 입학사정관 눈이 띠용!하게 만드는 비법!',
      tags: ['차별화', '스토리텔링', '심화탐구']
    }
  ];

  const handleCardClick = (id: string) => {
    navigate(`/brain/${id}`);
  };

  return (
    <div className="p-4 md:p-0 pb-20">
      {/* Header Section removed -> handled by Desktop Nav */}

      <div className="space-y-6">
        {/* 1. Main Featured Card: 세특 100% 이해하기 */}
        <div
          onClick={() => handleCardClick('must-read')}
          className="bg-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lightbulb size={120} />
          </div>
          <div className="relative z-10">
            <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block shadow-sm">
              Must Read
            </span>
            <h3 className="text-2xl font-black mb-3 text-white">세특 100% 이해하기</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed max-w-lg font-medium">
              대학이 진짜 보고 싶은 건 단순한 '성실함'이 아닙니다.
              "얘는 진짜다"라는 느낌을 주는 세특의 본질적 정의와,
              입학사정관이 3초 만에 합격 시그널을 느끼는 포인트는 따로 있습니다.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-primary-light group-hover:text-white transition-colors bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
              지금 읽으러 가기 <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* 2. Strategy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${item.color} group-hover:rotate-6 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <ChevronRight className="text-gray-300 group-hover:text-gray-600" size={18} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1 font-medium">
                {item.desc}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {item.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
