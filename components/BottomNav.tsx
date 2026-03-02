
import React from 'react';
import { Home, Compass, TrendingUp, Swords, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { isAdmin } = useStore();

  // Hide on Detail Pages to make room for Comment Input
  const isDetail = path.startsWith('/post/') ||
    (path.startsWith('/archive/') && path !== '/archive') ||
    (path.startsWith('/arena/') && path !== '/arena');

  if (isDetail) return null;

  const navItems = [
    { id: '/', icon: Home, label: '홈' },
    { id: '/feed', icon: Compass, label: '탐구줍줍' },
    { id: '/archive', icon: TrendingUp, label: '이슈떡상' },
    { id: '/arena', icon: Swords, label: '토론찍먹' },
    // Dev: Always show admin link
    { id: '/admin', icon: Shield, label: '관리자' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 pb-safe-bottom z-50 transition-all duration-300 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-[68px] px-6">
        {navItems.map((item) => {
          // Check if active. Special logic for feed to include sub-routes but not confuse with home
          const isActive = item.id === '/'
            ? path === '/'
            : path.startsWith(item.id);

          return (
            <Link
              key={item.id}
              to={item.id}
              className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-gray-900 rounded-b-full"></div>
              )}
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''} mt-1`}>
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill="none"
                />
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 absolute bottom-1'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
