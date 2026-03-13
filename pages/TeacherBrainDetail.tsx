
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar } from 'lucide-react';
import { BRAIN_ARTICLES } from '../data/brainData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TeacherBrainDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const article = BRAIN_ARTICLES.find(a => a.id === id);

    if (!article) {
        return (
            <div className="p-20 text-center">
                <p className="text-gray-500 mb-4">존재하지 않는 가이드입니다.</p>
                <button onClick={() => navigate('/')} className="text-primary font-bold">돌아가기</button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen md:rounded-2xl md:shadow-soft md:mt-2 md:mb-6 overflow-hidden max-w-3xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-4 justify-between">
                <div className="flex items-center">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-800" />
                    </button>
                    <span className="ml-2 font-bold text-gray-900">세특 필수 가이드</span>
                </div>
                <button onClick={() => {
                    if (navigator.share) {
                        navigator.share({ title: article.title, text: article.subtitle, url: window.location.href });
                    } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('링크가 복사되었습니다!');
                    }
                }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                    <Share2 size={20} />
                </button>
            </div>

            <div className="px-6 py-8">
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
                        {article.title}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mb-4">
                        {article.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 border-b border-gray-100 pb-6">
                        <Calendar size={14} />
                        <span>{article.date}</span>
                        <span className="mx-1">·</span>
                        <span>angler project</span>
                    </div>
                </div>

                <div className="article-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom Style Mapping for Markdown Elements
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-black text-gray-900 mt-8 mb-4 border-b pb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 border-l-4 border-primary pl-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="text-[15px] md:text-base text-gray-700 leading-relaxed mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-700" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-gray-200 pl-4 py-2 my-6 bg-gray-50 text-gray-600 italic rounded-r-lg" {...props} />
                            ),
                            strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 bg-yellow-100/50 px-0.5" {...props} />,
                            code: ({ node, ...props }) => (
                                <code className="bg-gray-100 text-pink-600 rounded px-1.5 py-0.5 font-mono text-xs font-bold" {...props} />
                            ),
                            // Table Styling
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg">
                                    <table className="min-w-full text-sm text-left text-gray-500" {...props} />
                                </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
                            tr: ({ node, ...props }) => <tr className="hover:bg-gray-50" {...props} />,
                            th: ({ node, ...props }) => <th className="px-6 py-3 font-bold" {...props} />,
                            td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap md:whitespace-normal" {...props} />,
                            hr: ({ node, ...props }) => <hr className="my-8 border-gray-200" {...props} />,
                        }}
                    >
                        {article.content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-12 pt-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                    <p className="font-bold text-gray-800 mb-2">이 가이드가 도움이 되었나요?</p>
                    <p className="text-xs text-gray-500 mb-4">친구들에게 공유하고 함께 대학 가자!</p>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: article.title,
                                    text: article.subtitle,
                                    url: window.location.href,
                                });
                            } else {
                                alert('링크가 복사되었습니다!');
                            }
                        }}
                        className="bg-white border border-gray-200 text-gray-700 font-bold text-sm px-6 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        가이드 공유하기 🔗
                    </button>
                </div>
            </div>
        </div>
    );
};
