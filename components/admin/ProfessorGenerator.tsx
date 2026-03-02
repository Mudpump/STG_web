
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { GraduationCap, PenSquare } from 'lucide-react';
import { LogConsole } from '../LogConsole';
import { PROFESSORS } from '../../constants';
import { ProfessorTheme } from '../../agents/professorAgents';

export const ProfessorGenerator: React.FC = () => {
    const { generateProfessorPost } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    
    // Local State
    const [profId, setProfId] = useState<string>(PROFESSORS[0].id);
    const [profTheme, setProfTheme] = useState<ProfessorTheme>('ROADMAP');
    const [profInstruction, setProfInstruction] = useState('');

    const handleGenerate = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);
        try {
            await generateProfessorPost((msg) => {
                setLogs(prev => [...prev, msg]);
            }, profId, profTheme, profInstruction);
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Error: ${e.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <GraduationCap size={20} className="text-gray-900" />
                    <h3 className="font-bold text-gray-900">교수 에이전트 (Professor)</h3>
                </div>
                {isRunning && <span className="text-xs text-green-500 animate-pulse">● Running</span>}
            </div>
            
            <p className="text-gray-500 text-xs mb-4">6가지 테마 기반의 심층 게시글 생성 (석박사 조교 댓글 포함)</p>

            <div className="space-y-3 mb-4">
                <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">교수 선택</label>
                    <select 
                        value={profId}
                        onChange={(e) => setProfId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-900"
                    >
                        {PROFESSORS.map(p => (
                            <option key={p.id} value={p.id}>[{p.title}] {p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">콘텐츠 테마</label>
                    <select 
                        value={profTheme}
                        onChange={(e) => setProfTheme(e.target.value as ProfessorTheme)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-900"
                    >
                        <option value="ROADMAP">🎓 [Roadmap] 3년 로드맵</option>
                        <option value="PINPOINT">📌 [Pinpoint] 교과 핀포인트</option>
                        <option value="METHODOLOGY">🧪 [Methodology] 탐구 방법론</option>
                        <option value="CLINIC">🚑 [Clinic] 주제 심폐소생술</option>
                        <option value="TRANSLATION">✍️ [Translation] 보고서 말투 변환</option>
                        <option value="CROSSOVER">🔗 [Crossover] 미친 융합</option>
                        <option value="CUSTOM">⚙️ [Custom] 직접 지시</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">추가 지시사항 (선택)</label>
                    <textarea 
                        value={profInstruction}
                        onChange={(e) => setProfInstruction(e.target.value)}
                        placeholder="예: 확률과 통계 과목과 엮어주세요."
                        className="w-full h-16 resize-none bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isRunning}
                className="w-full py-2.5 bg-gray-900 text-white hover:bg-black rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
                {isRunning ? <div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> : <PenSquare size={14} />}
                교수님 게시글 생성
            </button>
            <LogConsole logs={logs} className="bg-gray-100 border-gray-200 text-gray-800" />
        </div>
    );
};
