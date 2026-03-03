
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, TrendingUp, Swords, Shield, PenSquare, GraduationCap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { isAdmin, currentUser, openLoginModal } = useStore();

  const navItems = [
    { id: '/', icon: Home, label: '홈' },
    { id: '/feed', icon: Compass, label: '탐구줍줍' },
    { id: '/archive', icon: TrendingUp, label: '이슈떡상' },
    { id: '/arena', icon: Swords, label: '토론찍먹' },
    // Dev: Always show admin link
    { id: '/admin', icon: Shield, label: '관리자' }
  ];

  // UX Logic: Hide "Write" button on read-only pages (Archive, Brain) for normal users, and always hide on Arena, Admin
  const isReadOnlyPage = ((path.startsWith('/archive') || path.startsWith('/brain')) && !isAdmin) || path.startsWith('/arena') || path.startsWith('/admin');

  let writeLink = '/write?type=FEED';
  let writeLabel = '새 글 쓰기';
  if (path.startsWith('/archive')) {
    if (isAdmin) {
      writeLink = '/write?type=ARCHIVE';
      writeLabel = '이슈떡상 자료 올리기';
    }
  } else if (path.startsWith('/arena')) {
    writeLink = '/write?type=ARENA';
    writeLabel = '토론 발제하기';
  }

  const handleWriteClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault(); // 페이지 이동 방지
      openLoginModal();
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#F8FAFC] border-r border-gray-200/60 px-5 py-8 z-50">
      <div className="mb-12 pl-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-gray-900 text-white p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl text-gray-900 tracking-tight font-bold cursor-pointer">
            세특각
          </h1>
        </Link>
        <p className="text-[11px] text-gray-500 mt-2 font-medium pl-1 tracking-wide uppercase">훔쳐보는 입시 정보 커뮤니티</p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          let isActive = false;
          if (item.id === '/') {
            isActive = path === '/';
          } else {
            isActive = path.startsWith(item.id);
          }

          return (
            <Link
              key={item.id}
              to={item.id}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-white text-gray-900 font-bold shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 font-medium border border-transparent'
                }`}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-700"}
              />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {!isReadOnlyPage && (
        <div className="pt-6">
          <Link
            to={writeLink}
            onClick={handleWriteClick}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            <PenSquare size={16} />
            {writeLabel}
          </Link>
        </div>
      )}
    </div>
  );
};
