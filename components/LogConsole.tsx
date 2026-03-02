
import React, { useEffect, useRef } from 'react';

interface Props {
    logs: string[];
    className?: string;
}

export const LogConsole: React.FC<Props> = ({ logs, className }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (logs.length === 0) return null;

    return (
        <div 
            ref={scrollRef}
            className={`bg-black/90 backdrop-blur rounded-lg p-3 font-mono text-[10px] md:text-xs text-green-400 max-h-[150px] overflow-y-auto shadow-inner border border-gray-700 mt-4 ${className}`}
        >
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 break-all">
                        <span className="opacity-50 flex-shrink-0">➜</span>
                        <span>{log}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
