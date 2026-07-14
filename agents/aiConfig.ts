// --- AI Provider Configuration (Runtime, stored in localStorage) ---
// 관리자 페이지에서 provider(gemini/nemotron)와 API 키를 직접 입력해 저장한다.
// 생성 로직은 전부 클라이언트(브라우저)에서 실행되므로 별도 서버/DB 없이 localStorage에 보관한다.

export type AIProvider = 'gemini' | 'nemotron' | 'gemma';

const PROVIDER_KEY = 'ai_provider';
const GEMINI_KEY = 'ai_gemini_api_key';
const NEMOTRON_KEY = 'ai_nemotron_api_key';
const GEMMA_KEY = 'ai_gemma_api_key';

const safeGet = (key: string): string => {
    try {
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key) || '';
    } catch (e) {
        console.warn('localStorage read failed', e);
    }
    return '';
};

const safeSet = (key: string, value: string) => {
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch (e) {
        console.warn('localStorage write failed', e);
    }
};

export const getAIProvider = (): AIProvider => {
    const p = safeGet(PROVIDER_KEY);
    if (p === 'nemotron') return 'nemotron';
    if (p === 'gemma') return 'gemma';
    return 'gemini'; // 기본값: gemini
};
export const setAIProvider = (provider: AIProvider) => safeSet(PROVIDER_KEY, provider);

export const getGeminiKey = (): string => safeGet(GEMINI_KEY);
export const setGeminiKey = (key: string) => safeSet(GEMINI_KEY, key.trim());

export const getNemotronKey = (): string => safeGet(NEMOTRON_KEY);
export const setNemotronKey = (key: string) => safeSet(NEMOTRON_KEY, key.trim());

export const getGemmaKey = (): string => safeGet(GEMMA_KEY);
export const setGemmaKey = (key: string) => safeSet(GEMMA_KEY, key.trim());

// 현재 선택된 provider에 대한 API 키를 반환한다.
export const getActiveKey = (): string => {
    const p = getAIProvider();
    if (p === 'nemotron') return getNemotronKey();
    if (p === 'gemma') return getGemmaKey();
    return getGeminiKey();
};

// 빌드 타임에 주입된 Gemini 키(fallback). 관리자가 키를 입력하지 않았을 때 사용.
export const getBuildTimeGeminiKey = (): string => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            const k = process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (k && k !== 'DUMMY_KEY') return k;
        }
    } catch (e) {
        // ignore
    }
    return '';
};
