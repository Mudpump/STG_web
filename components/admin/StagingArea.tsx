
import React from 'react';
import { useStore } from '../../context/StoreContext';
import { XCircle, CheckCircle2 } from 'lucide-react';

export const StagingArea: React.FC = () => {
    const { pendingScenarios, approveItem, approveComment, discardScenario } = useStore();

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-8 bg-gray-900 rounded-full"></div>
                발행 대기열 <span className="text-primary">{pendingScenarios.length}</span>
            </h3>

            <div className="space-y-4">
                {pendingScenarios.map((scenario) => {
                    let title = "";
                    let desc = "";
                    let thumbnail = null;
                    
                    if (scenario.type === 'FEED') {
                        title = scenario.postData?.title || "";
                        desc = scenario.postData?.previewText || "";
                    } else if (scenario.type === 'TREND') {
                        title = scenario.trendData?.title || "";
                        desc = scenario.trendData?.summary[0] || "";
                        thumbnail = scenario.trendData?.imageUrl;
                    } else if (scenario.type === 'VOTE') {
                        title = scenario.voteData?.title || "";
                        desc = scenario.voteData?.description || "";
                    } else if (scenario.type === 'COUNSELING') {
                        title = `[상담답변] ${scenario.counselingData?.postTitle}`;
                        desc = `${scenario.counselingData?.professorName}: ${scenario.counselingData?.professorComment.substring(0, 50)}...`;
                    }
                    
                    return (
                        <div key={scenario.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                                {/* --- Thumbnail Layout --- */}
                                <div className="flex-1 flex gap-3">
                                    {thumbnail && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                                            <img src={thumbnail} alt="thumb" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                                                scenario.type === 'FEED' ? 'bg-primary' : 
                                                scenario.type === 'TREND' ? 'bg-pink-500' : 
                                                scenario.type === 'COUNSELING' ? 'bg-orange-500' : 'bg-blue-500'
                                            }`}>
                                                {scenario.type}
                                            </span>
                                            <span className="text-xs text-gray-400 font-mono">{scenario.id}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{desc}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => discardScenario(scenario.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>

                            <div className="p-4 bg-white">
                                {!scenario.isApproved ? (
                                    <button 
                                        onClick={() => approveItem(scenario.id)}
                                        className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} />
                                        {scenario.type === 'COUNSELING' ? '교수님 답변 등록 (Main)' : '본문 발행 및 DB 저장'}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 p-2 rounded justify-center">
                                            <CheckCircle2 size={14} /> {scenario.type === 'COUNSELING' ? '교수님 답변 등록 완료' : '본문 발행 완료'}
                                        </div>
                                        <div className="border-t border-gray-100 pt-3">
                                            <p className="text-xs font-bold text-gray-500 mb-2">
                                                {scenario.type === 'COUNSELING' ? '조교 부연설명 승인' : '댓글 승인'} ({scenario.pendingComments.length}개 대기중)
                                            </p>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {scenario.pendingComments.map((comment) => (
                                                    <div key={comment.id} className="flex gap-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 items-start group hover:border-gray-300 transition-colors">
                                                        <div className="flex-1">
                                                            <span className="font-bold text-gray-700 mr-1">{comment.agentName}</span>
                                                            <span className="text-gray-400 text-[10px]">({comment.role})</span>
                                                            <p className="text-gray-600 mt-1">{comment.text}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => approveComment(scenario.id, comment.id)}
                                                            className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded font-bold hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
                                                        >
                                                            승인
                                                        </button>
                                                    </div>
                                                ))}
                                                {scenario.pendingComments.length === 0 && (
                                                    <div className="text-center text-gray-400 text-xs py-2">모든 댓글이 승인되었습니다.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {pendingScenarios.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        대기 중인 시나리오가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};
