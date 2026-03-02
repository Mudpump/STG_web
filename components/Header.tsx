
import React from 'react';
import { Bell, Search, GraduationCap, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useStore();
  const isMyPage = location.pathname === '/my';
  const isSearchPage = location.pathname === '/search';

  if (isSearchPage) return null;

  const handleProfileClick = () => {
    if (currentUser) {
        navigate('/my');
    } else {
        openLoginModal();
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center justify-between px-5 w-full">
      <Link to="/" className="flex items-center gap-2">
        <div className="text-gray-900">
            <GraduationCap size={22} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl text-gray-900 tracking-tight font-bold cursor-pointer">
          세특각
        </h1>
      </Link>
      
      {!isMyPage && (
        <div className="flex items-center gap-3 text-gray-800">
          <button 
            onClick={() => navigate('/search')}
            className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <Search size={20} className="text-gray-600" />
          </button>
          
          <button 
            onClick={handleProfileClick}
            className="hover:bg-gray-100 p-0.5 rounded-full transition-colors overflow-hidden border border-gray-200 w-8 h-8 flex items-center justify-center bg-white"
          >
            {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
                <div className="text-gray-500">
                    <UserIcon size={16} />
                </div>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
