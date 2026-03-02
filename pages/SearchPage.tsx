
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PostCard } from '../components/PostCard';
import { TrendCard } from '../components/TrendCard';
import { ArenaCard } from '../components/ArenaCard';

type SearchTab = 'ALL' | 'FEED' | 'TREND' | 'VOTE';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { posts, trends, votes } = useStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter Data Logic
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.content.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredTrends = trends.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.content.toLowerCase().includes(query.toLowerCase()) ||
    t.keyword.toLowerCase().includes(query.toLowerCase())
  );

  const filteredVotes = votes.filter(v => 
    v.title.toLowerCase().includes(query.toLowerCase()) || 
    v.description.toLowerCase().includes(query.toLowerCase())
  );

  // Determine visibility based on active tab and search query
  const showTrends = (activeTab === 'ALL' || activeTab === 'TREND') && filteredTrends.length > 0;
  const showVotes = (activeTab === 'ALL' || activeTab === 'VOTE') && filteredVotes.length > 0;
  const showFeed = (activeTab === 'ALL' || activeTab === 'FEED') && filteredPosts.length > 0;
  
  const hasResults = showTrends || showVotes || showFeed;

  // Tabs Configuration
  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'ALL', label: '통합검색' },
    { id: 'FEED', label: '탐구줍줍' },
    { id: 'TREND', label: '이슈떡상' },
    { id: 'VOTE', label: '토론찍먹' },
  ];

  return (
    <div className="bg-white min-h-screen md:bg-gray-50">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm md:shadow-none md:rounded-b-none md:max-w-5xl md:mx-auto">
          {/* 1. Search Input Bar */}
          <div className="h-16 flex items-center px-4 gap-3 md:px-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
              <Search size={20} className="text-gray-400 mr-2" />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="궁금한 입시 정보를 검색해보세요"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm font-medium"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Filter Tabs */}
          {query && (
              <div className="flex items-center px-4 md:px-6 pb-0 overflow-x-auto no-scrollbar gap-2">
                  {tabs.map((tab) => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap pb-3 pt-1 px-1 text-sm font-bold border-b-2 transition-colors ${
                              activeTab === tab.id
                              ? 'border-gray-900 text-gray-900'
                              : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* Results Area */}
      <div className="pb-20 md:max-w-5xl md:mx-auto md:py-6 min-h-[50vh]">
        {!query ? (
          <div className="p-10 text-center mt-10">
            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4 animate-bounce">
               <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">검색어를 입력하여<br/>세특 꿀팁을 찾아보세요!</p>
          </div>
        ) : !hasResults ? (
          <div className="p-10 text-center mt-10">
            <p className="text-gray-900 font-bold text-lg mb-1">'{query}'에 대한 결과가 없습니다.</p>
            <p className="text-gray-500 text-sm">다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <div className="space-y-8 p-4 md:p-0">
            
            {/* 1. Trends Results */}
            {showTrends && (
              <section>
                {activeTab === 'ALL' && (
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
                    <span className="text-lg">📚 이슈떡상</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{filteredTrends.length}</span>
                    </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredTrends.map(trend => (
                    <div key={trend.id} className="h-full">
                       <TrendCard item={trend} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Arena Results */}
            {showVotes && (
              <section>
                 {activeTab === 'ALL' && (
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
                    <span className="text-lg">🥊 토론찍먹</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{filteredVotes.length}</span>
                    </h3>
                 )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVotes.map(vote => (
                        <div key={vote.id}>
                            <ArenaCard item={vote} />
                        </div>
                    ))}
                </div>
              </section>
            )}

            {/* 3. Feed Results */}
            {showFeed && (
              <section>
                {activeTab === 'ALL' && (
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
                    <span className="text-lg">📢 탐구줍줍</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{filteredPosts.length}</span>
                    </h3>
                )}
                <div className="space-y-4 md:grid md:grid-cols-1 md:gap-4 md:space-y-0">
                  {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
