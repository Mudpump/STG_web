import { Type } from "@google/genai";
import { Post, Comment } from '../types';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

// --- Agent D: Comment Supplement ---
export const runAgentD = async (posts: Post[], log: (msg: string) => void): Promise<{ post: Post, comment: Comment }> => {
  log("💬 Agent D: 댓글 보완 타겟 분석 중...");
  if (!posts || posts.length === 0) throw new Error("분석할 게시글이 없습니다.");
  
  const targetPost = posts[Math.floor(Math.random() * posts.length)];
  const { commenters } = await fetchCastFromDB(null, 1);
  const commenter = commenters[0];

  const prompt = `
    You are Agent D, a helpful commenter.
    Current Year: 2026.
    [Post] Title: ${targetPost.title}, Content: ${targetPost.content}
    [Persona] ${commenter.nickname} (${commenter.role_type})
    
    [Task] Write a single, helpful, insightful comment in Korean.
    - Avoid outdated references (e.g. do not mention 2022 as 'this year').
    - Mention 2026-relevant tools if applicable.

    [Output JSON] { "text": "string" }
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING } },
        required: ["text"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  const comment: Comment = {
      id: Date.now().toString(),
      agentName: commenter.nickname,
      role: commenter.role_type,
      text: cleanText(result.text),
      likes: Math.floor(Math.random() * 20),
      createdAt: "방금 전",
      isUser: false
  };

  return { post: targetPost, comment };
};