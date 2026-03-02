import { GoogleGenAI } from "@google/genai";
import { supabase } from '../utils/supabase';
import { Agent } from '../types';

// --- Configuration ---
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY || 'DUMMY_KEY';
        }
    } catch (e) {
        console.warn("API Key access failed", e);
    }
    return 'DUMMY_KEY';
};

export const ai = new GoogleGenAI({ apiKey: getApiKey() });
export const MODEL_NAME = 'gemini-3-flash-preview';

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