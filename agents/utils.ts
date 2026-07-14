import { GoogleGenAI } from "@google/genai";
import { supabase } from '../utils/supabase';
import { Agent } from '../types';
import {
    getAIProvider,
    getGeminiKey,
    getNemotronKey,
    getGemmaKey,
    getBuildTimeGeminiKey,
} from './aiConfig';

// --- Model Names ---
export const MODEL_NAME = 'gemini-3-flash-preview';
const NEMOTRON_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';
const GEMMA_MODEL = 'google/gemma-4-31b-it';
// NVIDIA 엔드포인트는 브라우저 직접 호출 시 CORS로 차단되므로 same-origin 프록시를 거친다.
// (dev: vite server.proxy, prod: /api/nemotron 서버리스 함수)
// Nemotron/Gemma 모두 동일한 NVIDIA OpenAI 호환 엔드포인트를 사용하므로 프록시를 공유한다.
const NVIDIA_PROXY_URL = '/api/nemotron';

// --- Provider dispatch: keeps the `ai.models.generateContent(...)` interface ---
// 모든 agent 코드는 아래 형태로 호출한다:
//   const res = await ai.models.generateContent({ model, contents, config: { responseMimeType, responseSchema } });
//   JSON.parse(res.text)
// provider(gemini/nemotron)에 따라 실제 호출을 분기하되, 반환 형태({ text })는 동일하게 맞춘다.

interface GenerateContentArgs {
    model?: string;
    contents: string;
    config?: {
        responseMimeType?: string;
        responseSchema?: any;
        temperature?: number;
        [key: string]: any;
    };
}

// JSON 응답에서 코드펜스/잡텍스트를 제거하고 순수 JSON 문자열만 추출한다.
const extractJson = (raw: string): string => {
    if (!raw) return raw;
    let t = raw.trim();
    // ```json ... ``` 펜스 제거
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) t = fence[1].trim();
    // 첫 { 부터 마지막 } 까지 (또는 배열 [ ... ]) 만 취함
    const firstObj = t.indexOf('{');
    const firstArr = t.indexOf('[');
    let start = -1;
    if (firstObj === -1) start = firstArr;
    else if (firstArr === -1) start = firstObj;
    else start = Math.min(firstObj, firstArr);
    if (start > 0) {
        const lastObj = t.lastIndexOf('}');
        const lastArr = t.lastIndexOf(']');
        const end = Math.max(lastObj, lastArr);
        if (end > start) t = t.substring(start, end + 1);
    }
    return t.trim();
};

// --- Gemini ---
const runGemini = async ({ model, contents, config }: GenerateContentArgs): Promise<{ text: string }> => {
    const key = getGeminiKey() || getBuildTimeGeminiKey();
    if (!key) {
        throw new Error('Gemini API 키가 설정되지 않았습니다. 관리자 페이지 > AI 엔진 설정에서 키를 입력하세요.');
    }
    const client = new GoogleGenAI({ apiKey: key });
    const response = await client.models.generateContent({
        model: model || MODEL_NAME,
        contents,
        config,
    } as any);
    return { text: response.text || '' };
};

// --- NVIDIA (OpenAI-compatible REST): Nemotron / Gemma 공용 ---
const runNvidia = async (
    model: string,
    key: string,
    label: string,
    { contents, config }: GenerateContentArgs,
): Promise<{ text: string }> => {
    if (!key) {
        throw new Error(`${label} API 키가 설정되지 않았습니다. 관리자 페이지 > AI 엔진 설정에서 키를 입력하세요.`);
    }

    const wantsJson = config?.responseMimeType === 'application/json' || !!config?.responseSchema;

    // Gemini responseSchema를 Nemotron이 참고할 수 있도록 프롬프트 힌트로 변환한다.
    let systemPrompt = 'You are a helpful assistant.';
    if (wantsJson) {
        systemPrompt =
            'You are a strict JSON generator. Respond with ONLY a single valid JSON value and nothing else. ' +
            'Do not include markdown code fences, explanations, or any text outside the JSON.';
        if (config?.responseSchema) {
            systemPrompt += ' The JSON MUST conform to this schema (Gemini schema format): ' +
                JSON.stringify(config.responseSchema);
        }
    }

    const body: any = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contents },
        ],
        temperature: config?.temperature ?? 1,
        top_p: 0.95,
        max_tokens: 16384,
        stream: false,
        // thinking을 끄면 최종 JSON이 content로 바로 나와 파싱이 안정적이다.
        chat_template_kwargs: { enable_thinking: false },
    };
    if (wantsJson) {
        body.response_format = { type: 'json_object' };
    }

    const resp = await fetch(NVIDIA_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`${label} API 오류 (${resp.status}): ${errText.substring(0, 300)}`);
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content || '';
    return { text: wantsJson ? extractJson(content) : content };
};

// 통합 클라이언트: 기존 agent 코드는 `ai.models.generateContent(...)` 를 그대로 호출한다.
export const ai = {
    models: {
        generateContent: async (args: GenerateContentArgs): Promise<{ text: string }> => {
            const provider = getAIProvider();
            if (provider === 'nemotron') return runNvidia(NEMOTRON_MODEL, getNemotronKey(), 'Nemotron', args);
            if (provider === 'gemma') return runNvidia(GEMMA_MODEL, getGemmaKey(), 'Gemma', args);
            return runGemini(args);
        },
    },
};

// --- Helper Functions ---
export const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n').trim();
};

// --- DB Fetch Helper ---
export async function fetchCastFromDB(targetCategory: string | null, count: number): Promise<{ author: Agent, commenters: Agent[] }> {
    try {
        const { data: allAgents, error } = await supabase.from('agents').select('*');

        if (error || !allAgents || allAgents.length === 0) {
            console.error("Agent fetch error:", error);
            const fallback: Agent = { id: 'temp', nickname: '익명학생', major_category: 'ALL', role_type: 'Peer' };
            return { author: fallback, commenters: Array(count).fill(fallback) };
        }

        let authorPool = allAgents;
        if (targetCategory) {
            authorPool = allAgents.filter(a => a.major_category === targetCategory);
            if (authorPool.length === 0) authorPool = allAgents;
        }
        const author = authorPool[Math.floor(Math.random() * authorPool.length)];

        // Helper to shuffle array
        const shuffle = (array: Agent[]) => array.sort(() => 0.5 - Math.random());

        const potentialCommenters = allAgents.filter(a => a.id !== author.id);
        const shuffled = shuffle([...potentialCommenters]);

        // If we need more commenters than we have, cycle through them
        const commenters: Agent[] = [];
        if (shuffled.length > 0) {
            for (let i = 0; i < count; i++) {
                commenters.push(shuffled[i % shuffled.length]);
            }
        } else {
            commenters.push(...Array(count).fill(author));
        }

        return { author, commenters: shuffle(commenters) };

    } catch (e) {
        console.error("fetchCastFromDB Exception:", e);
        const fallback: Agent = { id: 'temp', nickname: '익명학생', major_category: 'ALL', role_type: 'Peer' };
        return { author: fallback, commenters: Array(count).fill(fallback) };
    }
}