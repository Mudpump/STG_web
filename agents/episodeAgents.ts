
import { Type } from "@google/genai";
import { EpisodeRecipe } from '../data/episodeData';
import { Post, Comment, Agent } from '../types';
import { ai, MODEL_NAME, cleanText, fetchCastFromDB } from './utils';

export async function runEpisodeAgent(
    recipe: EpisodeRecipe, 
    log: (msg: string) => void
): Promise<Post> {
    log(`🏫 Break Agent: [${recipe.type}] ${recipe.context.substring(0, 20)}... 시나리오 생성 중`);

    // 1. Casting (Random 10-12 generic agents)
    const { author, commenters } = await fetchCastFromDB(null, 12);
    
    // 2. Prompt Engineering
    const castNames = commenters.map(c => c.nickname).join(', ');

    const prompt = `
        You are a High School Student AI writer for an anonymous community board (like "Nate Pann" or "Blind").
        
        [Scenario Recipe]
        - Type: ${recipe.type} (Emotion: ${recipe.emotion})
        - Place: ${recipe.place}
        - Target: ${recipe.target}
        - Situation: ${recipe.situation}
        - Context (Seed): "${recipe.context}"

        [Cast]
        - Author: ${author.nickname}
        - Commenters: ${castNames}

        [Task]
        1. Write a Post based on the [Context].
           - **Length**: Write a detailed, immersive story (approx. 8-12 lines). Do NOT make it too short. Explain the situation vividly so readers can feel the emotion.
           - Tone: Korean high school slang, informal (Banmal), emotional.
           - Title: 'Aggro' title (clickbait-y) that draws attention.
           - **IMPORTANT**: Ignore the author's original major/persona. Just act like a normal student reacting to this specific situation.
        
        2. Generate 10 Comments.
           - **RELATIONSHIP**: The commenters do NOT know the author personally. They are strangers on the internet.
           - **Tone**: Realistic reactions from anonymous users.
             - Sympathy ("헐 ㅠㅠ 진짜 어떡해"), 
             - Teasing/Trolling ("ㅋㅋㅋㅋ 개웃기네"), 
             - Fact-checking ("근데 이건 니 잘못 아님?"), 
             - Advice ("나도 그랬는데 이렇게 해봐").
           - **Constraint**: Do NOT use the author's name in the comment (e.g., avoid "Hey Min-su"). Address them as "글쓴이" or just speak directly.
           - Tiki-taka flow (Comments replying to each other).

        [Output JSON]
        {
          "title": "string",
          "content": "string",
          "tags": ["string"],
          "comments": [
            { "agentName": "string", "text": "string" }
          ]
        }
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    comments: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                agentName: { type: Type.STRING },
                                text: { type: Type.STRING }
                            },
                            required: ["agentName", "text"]
                        }
                    }
                },
                required: ["title", "content", "tags", "comments"]
            }
        }
    });

    const result = JSON.parse(response.text || "{}");

    // 3. Formatting
    const formattedComments: Comment[] = (result.comments || []).map((c: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        agentName: c.agentName,
        role: 'Peer', // Generic role for break time
        text: cleanText(c.text),
        likes: Math.floor(Math.random() * 50),
        createdAt: `${Math.floor(Math.random() * 50) + 1}분 전`,
        isUser: false
    }));

    return {
        id: Date.now().toString(),
        categoryId: 'BREAK',
        authorAgent: author.nickname,
        authorRole: 'Student',
        title: cleanText(result.title),
        content: cleanText(result.content),
        previewText: cleanText(result.content).substring(0, 60) + '...',
        comments: formattedComments,
        viewCount: Math.floor(Math.random() * 300) + 50,
        likeCount: Math.floor(Math.random() * 100) + 10,
        createdAt: '방금 전',
        tags: result.tags || ['일상', '공감'],
        isUser: false,
        targetGrade: 'ALL',
        episodeType: recipe.type
    };
}
