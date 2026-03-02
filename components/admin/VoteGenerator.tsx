
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Swords } from 'lucide-react';
import { LogConsole } from '../LogConsole';

export const VoteGenerator: React.FC = () => {
    const { generateAIVote } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);
        try {
            await generateAIVote((msg) => setLogs(p => [...p, msg]));
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
                    <Swords size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-900">토론찍먹 (Vote)</h3>
                </div>
                {isRunning && <span className="text-xs text-blue-500 animate-pulse">● Running</span>}
            </div>
            
            <p className="text-gray-500 text-xs mb-4">논쟁적인 토론 주제 생성 (찬성 vs 반대)</p>

            <button 
                onClick={handleGenerate}
                disabled={isRunning}
                className="w-full py-2.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
                {isRunning ? <div className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div> : <Swords size={14} />}
                토론 주제 생성
            </button>
            <LogConsole logs={logs} className="bg-gray-900" />
        </div>
    );
};
