
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BookOpen } from 'lucide-react';
import { LogConsole } from '../LogConsole';

export const TrendGenerator: React.FC = () => {
    const { generateAITrend, generateSourceTrend, generateSearchTrend } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    
    // Local State
    const [mode, setMode] = useState<'AUTO' | 'SOURCE' | 'SEARCH'>('AUTO');
    const [sourceText, setSourceText] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleGenerate = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);

        try {
            if (mode === 'AUTO') {
                await generateAITrend((msg) => setLogs(p => [...p, msg]));
            } else if (mode === 'SOURCE') {
                if (!sourceText.trim()) { alert("분석할 텍스트를 입력해주세요."); setIsRunning(false); return; }
                await generateSourceTrend((msg) => setLogs(p => [...p, msg]), sourceText);
            } else if (mode === 'SEARCH') {
                await generateSearchTrend((msg) => setLogs(p => [...p, msg]), searchKeyword);
            }
        } catch (e: any) {
            setLogs(p => [...p, `❌ Error: ${e.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-pink-600" />
                    <h3 className="font-bold text-gray-900">이슈떡상 (Trend)</h3>
                </div>
                {isRunning && <span className="text-xs text-pink-500 animate-pulse">● Running</span>}
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button onClick={() => setMode('AUTO')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'AUTO' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>랜덤</button>
                <button onClick={() => setMode('SEARCH')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'SEARCH' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>검색</button>
                <button onClick={() => setMode('SOURCE')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'SOURCE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>소스</button>
            </div>
            
            {mode === 'AUTO' ? (
                <p className="text-gray-500 text-xs mb-4">최신 트렌드 리포트 자동 생성</p>
            ) : mode === 'SEARCH' ? (
                <div className="mb-4">
                     <p className="text-gray-500 text-xs mb-2">빈칸으로 두면 AI가 '최신 이슈'를 자동 검색합니다.</p>
                     <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="검색어 (예: 양자컴퓨터, 노벨상)" className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-pink-500"/>
                </div>
            ) : (
                <div className="mb-4">
                     <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="기사/대본을 붙여넣으세요." className="w-full h-24 resize-none bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg p-3 outline-none focus:border-pink-500 placeholder:text-gray-400"/>
                </div>
            )}

            <button 
                onClick={handleGenerate}
                disabled={isRunning}
                className="w-full py-2.5 bg-pink-500 text-white hover:bg-pink-600 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
                {isRunning ? <div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> : <BookOpen size={14} />}
                트렌드 생성
            </button>
            <LogConsole logs={logs} className="bg-gray-900" />
        </div>
    );
};
