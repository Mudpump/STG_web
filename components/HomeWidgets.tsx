
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bot, Target, Lock, ArrowUpRight, Swords, Sparkles, BookOpen } from 'lucide-react';
import { PROFESSORS, CATEGORIES } from '../constants';
import { CategoryId } from '../types';

// 1. Hero Section: Admissions Officer (Premium Editorial Style)
export const AdmissionOfficerCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/brain/must-read')}
      className="w-full bg-black md:rounded-[2rem] overflow-hidden relative group cursor-pointer active:scale-[0.99] transition-all duration-500 shadow-2xl min-h-[480px] md:min-h-[560px] flex items-end"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000"
          alt="Hero Background"
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full p-6 md:p-12 pb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full mb-6">
          <Lock size={14} className="text-yellow-400" />
          <span className="text-xs font-bold tracking-widest uppercase">Top Secret</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5 tracking-tight">
          입학사정관의 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">시크릿 노트</span>
        </h2>
        <p className="text-base md:text-lg text-gray-300 font-medium mb-10 max-w-xl leading-relaxed">
          합격하는 생기부에는 공식이 있습니다. 수천 건의 데이터를 분석한 AI가 알려주는 극상위권 세특의 비밀을 확인하세요.
        </p>

        {/* Button-like Link */}
        <div className="inline-flex items-center gap-2 text-sm font-bold bg-white text-black px-8 py-4 rounded-full transition-transform group-hover:translate-x-2 shadow-lg">
          지금 읽으러 가기
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
};

// 2. Strategy Section: Essential Guides (Compact Grid Style)
export const StrategySection: React.FC = () => {
  const navigate = useNavigate();

  const guides = [
    {
      title: '선생님 세특전략',
      desc: 'AI 기반 작성법',
      icon: <BookOpen size={20} className="text-indigo-500" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      path: '/brain/ai-teacher'
    },
    {
      title: '학생 필승전략',
      desc: '역이용 & 보고서',
      icon: <Swords size={20} className="text-rose-500" />,
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      path: '/brain/our-strategy'
    },
    {
      title: '세특각 활용법',
      desc: '100% 활용 가이드',
      icon: <Sparkles size={20} className="text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      path: '/brain/how-to-use'
    },
    {
      title: '우리반 대응전략',
      desc: '학교/학급 맞춤형',
      icon: <Target size={20} className="text-emerald-500" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      path: '/brain/class-strategy'
    }
  ];

  return (
    <div className="mt-8">
      <div className="px-1 mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
        <h3 className="font-bold text-gray-900 tracking-tight text-base">
          세특 필수 가이드
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            onClick={() => navigate(guide.path)}
            className="bg-white rounded-2xl p-4 border border-gray-200/60 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 transition-all duration-200 flex items-center gap-3 group"
          >
            <div className={`w-10 h-10 rounded-xl ${guide.bg} border ${guide.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {guide.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{guide.title}</h4>
              <p className="text-[11px] text-gray-500 font-medium truncate">{guide.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Professor List Widget
interface ProfessorListProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export const ProfessorList: React.FC<ProfessorListProps> = ({ selectedCategory, onSelectCategory }) => {
  const navigate = useNavigate();

  // Drag Logic State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;

    setIsDragging(true);
    setDragDistance(0);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging && scrollRef.current) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
      setDragDistance(Math.abs(walk));
    }
  };

  const handleCategoryClick = (id: CategoryId) => {
    // Prevent click if dragged
    if (dragDistance > 5) return;
    onSelectCategory(id);
  };

  // Filter Logic
  const displayProfessors = selectedCategory === 'ALL'
    ? PROFESSORS
    : PROFESSORS.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="mt-12">
      {/* Title Section - Applied font-logo */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
        <h3 className="font-logo text-xl font-bold text-gray-900 tracking-tight">
          나의 전공 교수님 찾기
        </h3>
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="relative group">
        {/* Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />

        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 px-1 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        >
          {/* Filter out 'BREAK' AND 'MY_PROFS' */}
          {CATEGORIES.filter(c => c.id !== 'BREAK' && c.id !== 'MY_PROFS').map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex-shrink-0 ${selectedCategory === cat.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-600 border-gray-200/60 hover:bg-gray-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
          <div className="w-8 flex-shrink-0"></div>
        </div>
      </div>

      {/* Professor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayProfessors.map((prof) => (
          <div
            key={prof.id}
            onClick={() => navigate(`/major/${prof.id}`)}
            className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="relative flex-shrink-0">
              {/* Avatar - Passport Photo Style */}
              <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-emerald-500/50 transition-colors bg-gray-50 shadow-inner">
                <img src={prof.imageUrl} alt={prof.name} className="w-full h-full object-cover object-top" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h4 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition-colors">{prof.name}</h4>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{prof.title}</span>
              </div>
              {/* Description with 3-line limit, removed truncate */}
              <div className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed font-medium">
                "{prof.introduction}"
              </div>

              {/* Horizontal Scroll for HashTags */}
              <div className="relative">
                {/* Gradient Fade for tags */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                  {prof.hashTags.map(tag => (
                    <span key={tag} className="whitespace-nowrap flex-shrink-0 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 ml-1" />
          </div>
        ))}

        {displayProfessors.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200/60">
            해당 전공의 교수님이<br />아직 부임하지 않았어요 😅
          </div>
        )}
      </div>
    </div>
  );
};
