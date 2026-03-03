
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircleQuestion } from 'lucide-react';
import { LogConsole } from '../LogConsole';

export const CounselingGenerator: React.FC = () => {
    const { posts, answerCounseling } = useStore();
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [instruction, setInstruction] = useState('');

    // 답변 대기 중인 글 필터링 (교수님이 직접 작성한 연구실 게시글 제외)
    const unansweredPosts = posts.filter(p =>
        p.targetProfessorId &&
        p.authorRole !== 'Professor' &&
        p.comments.every(c => c.role !== 'Professor')
    );

    const handleAnswer = async (postId: string) => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);

        try {
            await answerCounseling(postId, instruction, (msg) => {
                setLogs(prev => [...prev, msg]);
            });
            setInstruction('');
        } catch (e: any) {
            setLogs(prev => [...prev, `❌ Error: ${e.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col order-first md:order-none col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageCircleQuestion size={20} className="text-orange-500" />
                    <h3 className="font-bold text-gray-900">학생 상담소 (Counseling)</h3>
                </div>
                {isRunning && <span className="text-xs text-green-500 animate-pulse">● Running</span>}
            </div>

            <p className="text-gray-500 text-xs mb-4">답변 대기 중인 학생 질문 ({unansweredPosts.length}건)</p>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-xl p-2 bg-gray-50">
                {unansweredPosts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-500">{post.authorAgent} ({post.targetGrade || '학년미상'})</span>
                            <span className="text-xs text-primary font-bold">{post.createdAt}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{post.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-3 mb-3 bg-gray-50 p-2 rounded">{post.content}</p>

                        <div className="flex gap-2">
                            <input
                                placeholder="관리자 지시사항 (선택: 예 - 좀 더 따뜻하게)"
                                className="flex-1 text-xs border border-gray-200 rounded px-2 outline-none focus:border-orange-500"
                                value={instruction}
                                onChange={e => setInstruction(e.target.value)}
                            />
                            <button
                                onClick={() => handleAnswer(post.id)}
                                disabled={isRunning}
                                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 disabled:opacity-50"
                            >
                                답변 달기
                            </button>
                        </div>
                    </div>
                ))}
                {unansweredPosts.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">대기 중인 상담 질문이 없습니다.</div>
                )}
            </div>
            <LogConsole logs={logs} className="bg-gray-900" />
        </div>
    );
};
