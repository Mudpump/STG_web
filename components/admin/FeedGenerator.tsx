
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Bot, Play, Coffee, Layers, Calendar } from 'lucide-react';
import { LogConsole } from '../LogConsole';
import { GradeType } from '../../types';

export const FeedGenerator: React.FC = () => {
    const { generateAIPost, generateAIPostAllCategories, generateCustomPost, generateAIEpisode } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Local State
    const [mode, setMode] = useState<'AUTO' | 'CUSTOM' | 'EPISODE' | 'ALL_CATS'>('AUTO');
    const [targetGrade, setTargetGrade] = useState<GradeType>('H1');
    const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth() + 1);
    const [keyword, setKeyword] = useState(''); 
    const [count, setCount] = useState<number>(1);
    const [customMajor, setCustomMajor] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [episodeSeed, setEpisodeSeed] = useState('');

    const handleGenerate = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);

        try {
            if (mode === 'EPISODE') {
                await generateAIEpisode((msg) => setLogs(p => [...p, msg]), count, episodeSeed);
            } else if (mode === 'AUTO') {
                for(let i=0; i < count; i++) {
                    setLogs(p => [...p, `🔄 [${i+1}/${count}] 게시글 생성 시작...`]);
                    await generateAIPost((msg) => setLogs(p => [...p, msg]), targetGrade, targetMonth, keyword);
                }
                setLogs(p => [...p, `✅ 총 ${count}개 생성 완료.`]);
            } else if (mode === 'ALL_CATS') {
                await generateAIPostAllCategories((msg) => setLogs(p => [...p, msg]), targetGrade, targetMonth);
            } else if (mode === 'CUSTOM') {
                if (!customMajor.trim() || !customInstruction.trim()) {
                    alert("전공과 가이드를 입력해주세요.");
                    setIsRunning(false);
                    return;
                }
                await generateCustomPost((msg) => setLogs(p => [...p, msg]), customMajor, targetGrade, customInstruction);
            }
        } catch (e: any) {
            setLogs(p => [...p, `❌ Error: ${e.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-white border border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-primary-light" />
                    <h3 className="font-bold">탐구줍줍 (Feed)</h3>
                </div>
                {isRunning && <span className="text-xs text-green-400 animate-pulse">● Running</span>}
            </div>

            <div className="flex bg-gray-800 p-1 rounded-lg mb-4">
                <button onClick={() => setMode('AUTO')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'AUTO' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>자동 랜덤</button>
                <button onClick={() => setMode('ALL_CATS')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'ALL_CATS' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>전과목</button>
                <button onClick={() => setMode('CUSTOM')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'CUSTOM' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'}`}>시나리오</button>
                <button onClick={() => setMode('EPISODE')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${mode === 'EPISODE' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>에피소드</button>
            </div>

            {mode === 'AUTO' || mode === 'ALL_CATS' ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-1 block">타겟 학년</label>
                        <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value as GradeType)} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
                            <option value="H1">고1</option>
                            <option value="H2">고2</option>
                            <option value="H3">고3</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-1 block">타겟 시기</label>
                        <div className="relative">
                            <select value={targetMonth} onChange={(e) => setTargetMonth(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary appearance-none">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (<option key={m} value={m}>{m}월</option>))}
                            </select>
                            <Calendar size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    {mode === 'AUTO' && (
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 font-bold mb-1 block">생성 개수 (1~10)</label>
                            <input type="number" min="1" max="10" value={count} onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value))))} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary"/>
                        </div>
                    )}
                    {mode === 'AUTO' && (
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 font-bold mb-1 block">키워드 (선택)</label>
                            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 편의점, 야구 (빈칸 시 완전 랜덤)" className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary placeholder:text-gray-600"/>
                        </div>
                    )}
                </div>
            ) : mode === 'CUSTOM' ? (
                <div className="space-y-3 mb-4">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 font-bold mb-1 block">희망 전공</label>
                            <input value={customMajor} onChange={(e) => setCustomMajor(e.target.value)} placeholder="예: 산업공학과" className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary placeholder:text-gray-600"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold mb-1 block">학년</label>
                            <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value as GradeType)} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
                                <option value="H1">고1</option>
                                <option value="H2">고2</option>
                                <option value="H3">고3</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className="text-xs text-gray-400 font-bold mb-1 block">가이드</label>
                        <textarea value={customInstruction} onChange={(e) => setCustomInstruction(e.target.value)} placeholder="구체적인 상황 설정" className="w-full h-20 resize-none bg-gray-800 border border-gray-700 text-white text-xs rounded-lg p-3 outline-none focus:border-primary placeholder:text-gray-600 leading-relaxed"/>
                     </div>
                </div>
            ) : (
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-1 block">생성 개수 (최대 10개)</label>
                        <input type="number" min="1" max="10" value={count} onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value))))} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500"/>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold mb-1 block">시드 프롬프트 (선택)</label>
                        <textarea value={episodeSeed} onChange={(e) => setEpisodeSeed(e.target.value)} placeholder="예: 야자 시간에 몰래 컵라면 먹다 걸린 썰 (빈칸 시 완전 랜덤)" className="w-full h-20 resize-none bg-gray-800 border border-gray-700 text-white text-xs rounded-lg p-3 outline-none focus:border-amber-500 placeholder:text-gray-600 leading-relaxed"/>
                    </div>
                </div>
            )}

            <button 
                onClick={handleGenerate}
                disabled={isRunning}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${
                    mode === 'EPISODE' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 
                    mode === 'ALL_CATS' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                    mode === 'CUSTOM' ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-primary'
                }`}
            >
                {isRunning ? <div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> : mode === 'EPISODE' ? <Coffee size={14} /> : mode === 'ALL_CATS' ? <Layers size={14} /> : <Play size={14} />}
                {mode === 'AUTO' ? `${count}개 자동 생성` : mode === 'ALL_CATS' ? '전 카테고리 일괄 생성' : mode === 'CUSTOM' ? '커스텀 시나리오 생성' : '에피소드 생성 시작'}
            </button>
            <LogConsole logs={logs} />
        </div>
    );
};
