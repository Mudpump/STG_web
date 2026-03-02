
import React, { useRef, useState } from 'react';
import { CATEGORIES } from '../constants';
import { CategoryId } from '../types';

interface Props {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export const CategoryBar: React.FC<Props> = ({ selected, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only enable custom drag for mouse. Touch uses native scrolling.
    if (e.pointerType !== 'mouse') return;
    
    setIsDragging(true);
    setDragDistance(0);
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
      // Capture pointer to track movement outside element
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
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      scrollRef.current.scrollLeft = scrollLeft - walk;
      setDragDistance(Math.abs(walk));
    }
  };

  const handleClick = (id: CategoryId) => {
      // If dragged significantly, don't select
      if (dragDistance > 5) return;
      onSelect(id);
  };

  return (
    <div className="relative w-full group">
       {/* Gradient Fade - Right */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/60 to-transparent pointer-events-none z-10 hidden md:block" />

      <div className="bg-transparent md:bg-white md:rounded-t-2xl md:pt-4 w-full">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar py-3 px-4 md:px-6 gap-2 w-full cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border flex-shrink-0 ${
                selected === cat.id
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200/60 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {/* Spacer to prevent last item hidden behind fade */}
          <div className="w-8 flex-shrink-0 md:w-16"></div>
        </div>
      </div>
    </div>
  );
};
