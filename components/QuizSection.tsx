
import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { CheckCircle2, XCircle, Trophy, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../utils/supabase';

interface Props {
    quizzes: Quiz[];
    trendId: string;
}

export const QuizSection: React.FC<Props> = ({ quizzes, trendId }) => {
    const { currentUser, openLoginModal, submitQuizAnswer } = useStore();
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
    const [earnedPoints, setEarnedPoints] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<number, boolean>>({});
    const [alreadyAnswered, setAlreadyAnswered] = useState<Record<number, boolean>>({});

    // Check for previously answered quizzes on mount
    useEffect(() => {
        if (!currentUser || !trendId) return;
        const checkPrevious = async () => {
            const { data } = await supabase
                .from('user_answers')
                .select('quiz_index, is_correct, points_earned')
                .eq('user_id', currentUser.uid)
                .eq('trend_id', trendId);

            if (data && data.length > 0) {
                const answered: Record<number, boolean> = {};
                data.forEach((d: any) => {
                    answered[d.quiz_index] = true;
                });
                setAlreadyAnswered(answered);
            }
        };
        checkPrevious();
    }, [currentUser, trendId]);

    const handleSelect = (qIndex: number, optionIndex: number) => {
        if (isSubmitted[qIndex]) return;
        setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    };

    const handleSubmit = async (qIndex: number) => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        if (userAnswers[qIndex] === undefined) return;

        setIsSubmitting(prev => ({ ...prev, [qIndex]: true }));
        setIsSubmitted(prev => ({ ...prev, [qIndex]: true }));

        const isCorrect = userAnswers[qIndex] === quizzes[qIndex].answer;

        try {
            const points = await submitQuizAnswer(trendId, qIndex, isCorrect);
            setEarnedPoints(prev => ({ ...prev, [qIndex]: points }));
        } catch (e) {
            console.error('Quiz submission error:', e);
            setEarnedPoints(prev => ({ ...prev, [qIndex]: 0 }));
        } finally {
            setIsSubmitting(prev => ({ ...prev, [qIndex]: false }));
        }
    };

    // Helper to render question with <보기> Box support
    const renderQuestion = (rawQuestion: string, qIndex: number) => {
        // 1. Remove unwanted prefix like [<보기> 적용] (legacy support)
        let cleanQ = rawQuestion.replace(/\[<보기>\s*적용\]/g, '').trim();
        let boxContent = null;

        // 2. Extract <보기> content with Robust Regex
        const boxRegex = /<보기>([\s\S]*?)<\/보기>/g;
        const matches = [...cleanQ.matchAll(boxRegex)];

        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            if (lastMatch.index !== undefined) {
                boxContent = lastMatch[1].trim();
                cleanQ = cleanQ.substring(0, lastMatch.index) + cleanQ.substring(lastMatch.index + lastMatch[0].length);
                cleanQ = cleanQ.trim();
            }
        }

        return (
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 leading-snug text-base mb-3 whitespace-pre-line">
                    Q{qIndex + 1}. {cleanQ}
                </h3>
                {boxContent && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-4 relative mt-2">
                        <span className="font-bold text-gray-500 text-xs absolute -top-2.5 left-3 bg-gray-50 px-1 border border-gray-200 rounded">
                            &lt;보기&gt;
                        </span>
                        {boxContent}
                    </div>
                )}
            </div>
        );
    };

    if (!quizzes || quizzes.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Trophy className="text-primary" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">독해력 퀴즈</h2>
                    <p className="text-xs text-gray-500">문제를 풀고 리더보드 점수를 획득하세요! (+10점)</p>
                </div>
            </div>

            <div className="space-y-8">
                {quizzes.map((quiz, qIndex) => {
                    const isCorrect = userAnswers[qIndex] === quiz.answer;
                    const submitted = isSubmitted[qIndex];
                    const submitting = isSubmitting[qIndex];
                    const wasAlreadyAnswered = alreadyAnswered[qIndex];
                    const points = earnedPoints[qIndex];

                    return (
                        <div key={qIndex} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                            <div className="flex items-start gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded text-white mt-0.5 flex-shrink-0 ${quiz.type === 'FACT_CHECK' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                    {quiz.type === 'FACT_CHECK' ? '일치/불일치' : '추론/적용'}
                                </span>
                                {renderQuestion(quiz.question, qIndex)}
                            </div>

                            {wasAlreadyAnswered && !submitted && (
                                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                                    ⚠️ 이미 풀었던 문제입니다. 다시 풀어도 점수가 반영되지 않습니다.
                                </div>
                            )}

                            <div className="space-y-2 mb-4">
                                {quiz.options.map((option, oIndex) => {
                                    let btnClass = "w-full text-left p-3 rounded-lg text-sm border transition-all ";

                                    if (submitted) {
                                        if (oIndex === quiz.answer) {
                                            btnClass += "bg-green-50 border-green-200 text-green-700 font-bold";
                                        } else if (oIndex === userAnswers[qIndex] && !isCorrect) {
                                            btnClass += "bg-red-50 border-red-200 text-red-700";
                                        } else {
                                            btnClass += "bg-gray-50 border-gray-100 text-gray-400";
                                        }
                                    } else {
                                        if (userAnswers[qIndex] === oIndex) {
                                            btnClass += "bg-primary text-white border-primary shadow-md font-bold";
                                        } else {
                                            btnClass += "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300";
                                        }
                                    }

                                    return (
                                        <button
                                            key={oIndex}
                                            onClick={() => handleSelect(qIndex, oIndex)}
                                            disabled={submitted}
                                            className={btnClass}
                                        >
                                            <span className="mr-2 opacity-70">{oIndex + 1}.</span>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {!submitted ? (
                                <button
                                    onClick={() => handleSubmit(qIndex)}
                                    disabled={userAnswers[qIndex] === undefined || submitting}
                                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><Loader2 size={16} className="animate-spin" /> 제출 중...</>
                                    ) : (
                                        '정답 제출하기'
                                    )}
                                </button>
                            ) : (
                                <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-fade-in`}>
                                    <div className="flex items-center gap-2 mb-2 font-bold">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 size={18} className="text-green-600" />
                                                <span className="text-green-700">
                                                    정답입니다! {points !== undefined && points > 0 ? `(+${points}점)` : wasAlreadyAnswered ? '(이미 풀었던 문제)' : ''}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} className="text-red-600" />
                                                <span className="text-red-700">오답입니다.</span>
                                            </>
                                        )}

                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed border-t border-black/5 pt-2 mt-2">
                                        <span className="font-bold mr-1">💡 해설:</span>
                                        {quiz.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
