import React, { useState } from 'react';
import { Cpu, KeyRound, Check, Save } from 'lucide-react';
import {
    AIProvider,
    getAIProvider,
    setAIProvider,
    getGeminiKey,
    setGeminiKey,
    getNemotronKey,
    setNemotronKey,
    getGemmaKey,
    setGemmaKey,
} from '../../agents/aiConfig';

export const AISettings: React.FC = () => {
    const [provider, setProvider] = useState<AIProvider>(getAIProvider());
    const [geminiKey, setGeminiKeyState] = useState(getGeminiKey());
    const [nemotronKey, setNemotronKeyState] = useState(getNemotronKey());
    const [gemmaKey, setGemmaKeyState] = useState(getGemmaKey());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setAIProvider(provider);
        setGeminiKey(geminiKey);
        setNemotronKey(nemotronKey);
        setGemmaKey(gemmaKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const activeKey = provider === 'nemotron' ? nemotronKey : provider === 'gemma' ? gemmaKey : geminiKey;
    const isReady = !!activeKey.trim();

    return (
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-white border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Cpu size={20} className="text-primary-light" />
                    <h3 className="font-bold">AI 엔진 설정</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isReady ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isReady ? '● 생성 준비됨' : '● API 키 없음'}
                </span>
            </div>

            {/* Provider 선택 */}
            <label className="text-xs text-gray-400 font-bold mb-2 block">엔진 선택</label>
            <div className="flex bg-gray-800 p-1 rounded-lg mb-5 gap-1">
                <button
                    onClick={() => setProvider('gemini')}
                    className={`flex-1 text-xs font-bold py-2.5 rounded-md transition-colors ${provider === 'gemini' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Gemini
                </button>
                <button
                    onClick={() => setProvider('nemotron')}
                    className={`flex-1 text-xs font-bold py-2.5 rounded-md transition-colors ${provider === 'nemotron' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Nemotron
                </button>
                <button
                    onClick={() => setProvider('gemma')}
                    className={`flex-1 text-xs font-bold py-2.5 rounded-md transition-colors ${provider === 'gemma' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Gemma
                </button>
            </div>

            {/* 선택된 provider의 키 입력 */}
            {provider === 'gemini' ? (
                <div className="mb-5">
                    <label className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <KeyRound size={12} /> Gemini API 키
                    </label>
                    <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKeyState(e.target.value)}
                        placeholder="AIza... (Google AI Studio 키)"
                        autoComplete="off"
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 placeholder:text-gray-600 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">모델: gemini-3-flash-preview</p>
                </div>
            ) : provider === 'nemotron' ? (
                <div className="mb-5">
                    <label className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <KeyRound size={12} /> Nemotron (NVIDIA) API 키
                    </label>
                    <input
                        type="password"
                        value={nemotronKey}
                        onChange={(e) => setNemotronKeyState(e.target.value)}
                        placeholder="nvapi-... (build.nvidia.com 키)"
                        autoComplete="off"
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 placeholder:text-gray-600 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">모델: nvidia/nemotron-3-ultra-550b-a55b</p>
                </div>
            ) : (
                <div className="mb-5">
                    <label className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <KeyRound size={12} /> Gemma (NVIDIA) API 키
                    </label>
                    <input
                        type="password"
                        value={gemmaKey}
                        onChange={(e) => setGemmaKeyState(e.target.value)}
                        placeholder="nvapi-... (build.nvidia.com 키)"
                        autoComplete="off"
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-purple-500 placeholder:text-gray-600 font-mono"
                    />
                    <p className="text-[11px] text-gray-500 mt-1.5">모델: google/gemma-4-31b-it · NVIDIA 엔드포인트 사용 (Nemotron과 동일한 nvapi 키)</p>
                </div>
            )}

            <button
                onClick={handleSave}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}
            >
                {saved ? <><Check size={16} /> 저장됨</> : <><Save size={16} /> 설정 저장</>}
            </button>

            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                설정은 이 브라우저에만 저장됩니다. 저장 후 아래 생성기에서 바로 글 생성이 가능합니다.
            </p>
        </div>
    );
};
