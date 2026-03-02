
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Map } from 'lucide-react';
import { LogConsole } from '../LogConsole';
import { CATEGORIES } from '../../constants';
import { CategoryId } from '../../types';

export const RoadmapGenerator: React.FC = () => {
    const { generateRoadmapPost } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    
    // Local State
    const [roadmapCategory, setRoadmapCategory] = useState<CategoryId>('BIZ_ECON');
    const [roadmapMajor, setRoadmapMajor] = useState('');
    const [roadmapInstruction, setRoadmapInstruction] = useState('');

    const handleGenerate = async () => {
        if (isRunning) return;
        if (!roadmapMajor.trim()) { alert("학과 이름을 입력해주세요."); return; }
        
        setIsRunning(true);
        setLogs([]);
        try {
            await generateRoadmapPost((msg) => setLogs(p => [...p, msg]), roadmapCategory, roadmapMajor, roadmapInstruction);
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
                    <Map size={20} className="text-purple-600" />
                    <h3 className="font-bold text-gray-900">로드맵 (구버전)</h3>
                </div>
                {isRunning && <span className="text-xs text-purple-500 animate-pulse">● Running</span>}
            </div>
            
            <p className="text-gray-500 text-xs mb-4">학생용 로드맵 생성 (교수 모드가 더 강력함)</p>

            <div className="space-y-3 mb-4">
                <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">카테고리</label>
                    <select value={roadmapCategory} onChange={(e) => setRoadmapCategory(e.target.value as CategoryId)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-purple-500">
                        {CATEGORIES.filter(c => c.id !== 'ALL').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">희망 학과</label>
                    <input value={roadmapMajor} onChange={(e) => setRoadmapMajor(e.target.value)} placeholder="예: 산업공학과" className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-purple-500"/>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isRunning}
                className="w-full py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
                {isRunning ? <div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> : <Map size={14} />}
                3년 로드맵 생성
            </button>
            <LogConsole logs={logs} className="bg-gray-900" />
        </div>
    );
};
