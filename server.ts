import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client for server-side use
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint to generate session title and category classification based on first question
app.post("/api/title", async (req, res) => {
  try {
    const { prompt, model = "gemini-3.8-flash", provider = "gemini", apiKey, baseUrl } = req.body;
    if (!prompt) {
      return res.json({ title: "새로운 대화", category: "일반" });
    }

    const classifyPrompt = `사용자의 첫 질문을 분석하여 아래 2가지를 결정해주세요:
1. title: 3~7단어 이내의 직관적인 한국어 대화 제목
2. category: 내용에 따라 다음 5가지 중 가장 적합한 카테고리 하나만 선택: ["업무", "개발", "개인", "학습", "일반"]
- 업무: 비즈니스, 보고서, 이메일, 제안서, 기획, 회사 업무, 계약 등
- 개발: 코딩, 프로그래밍, React, TypeScript, SQL, 버그 해결, 알고리즘 등
- 개인: 일상 고민, 취미, 여행, 레시피, 대화, 건강 등
- 학습: 학술 개념, 외국어, 시험, 자격증, 역사, 과학 등
- 일반: 그 외

질문: "${prompt}"

반드시 다음 JSON 형식으로만 출력하세요 (코드블록 없이):
{"title": "대화 제목", "category": "카테고리명"}`;

    const parseResult = (text: string) => {
      try {
        const cleaned = text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const allowedCategories = ["업무", "개발", "개인", "학습", "일반"];
          const cat = allowedCategories.includes(parsed.category) ? parsed.category : "일반";
          return {
            title: parsed.title ? String(parsed.title).replace(/['"]/g, "").trim() : prompt.slice(0, 18),
            category: cat
          };
        }
      } catch (e) {
        // Fallback keyword detection
      }
      return fallbackCategory(prompt);
    };

    const fallbackCategory = (p: string) => {
      const lower = p.toLowerCase();
      let cat = "일반";
      if (/코드|함수|개발|프로그래밍|react|javascript|typescript|python|html|css|sql|api|버그|git/i.test(lower)) {
        cat = "개발";
      } else if (/업무|회사|이메일|보고서|기획|제안서|미팅|회의|클라이언트|비즈니스/i.test(lower)) {
        cat = "업무";
      } else if (/공부|학습|개념|원리|시험|영어|외국어|번역|설명/i.test(lower)) {
        cat = "학습";
      } else if (/취미|여행|요리|음식|일상|운동|건강|영화|추천/i.test(lower)) {
        cat = "개인";
      }
      return { title: prompt.slice(0, 18) + (prompt.length > 18 ? "..." : ""), category: cat };
    };

    if (provider === "chatanywhere" || provider === "openai") {
      const activeApiKey = apiKey || process.env.CHATANYWHERE_API_KEY || "";
      const activeBaseUrl = baseUrl || "https://api.chatanywhere.tech/v1";

      if (!activeApiKey) {
        return res.json(fallbackCategory(prompt));
      }

      const response = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [{ role: "user", content: classifyPrompt }],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        return res.json(fallbackCategory(prompt));
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "";
      return res.json(parseResult(rawText));
    } else {
      // Gemini
      const response = await ai.models.generateContent({
        model: model && model.startsWith("gemini") ? model : "gemini-3.8-flash",
        contents: classifyPrompt,
        config: { temperature: 0.3 },
      });
      const rawText = response.text || "";
      return res.json(parseResult(rawText));
    }
  } catch (err) {
    console.error("Title and category generation error:", err);
    return res.json({ title: req.body?.prompt?.slice(0, 18) || "새로운 대화", category: "일반" });
  }
});

// API endpoint for chat completions supporting Gemini and ChatAnywhere / OpenAI-compatible APIs
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-3.8-flash", provider = "gemini", apiKey, baseUrl, systemPrompt, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Handle ChatAnywhere or custom OpenAI-compatible provider
    if (provider === "chatanywhere" || provider === "openai") {
      const activeApiKey = apiKey || process.env.CHATANYWHERE_API_KEY || "";
      const activeBaseUrl = baseUrl || "https://api.chatanywhere.tech/v1";

      if (!activeApiKey) {
        return res.status(400).json({ 
          error: "ChatAnywhere / OpenAI API 키가 필요합니다. 설정(Settings)에서 API 키를 입력해주세요." 
        });
      }

      const formattedMessages = [];
      if (systemPrompt) {
        formattedMessages.push({ role: "system", content: systemPrompt });
      }
      for (const m of messages) {
        formattedMessages.push({ role: m.role, content: m.content });
      }

      const response = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: formattedMessages,
          temperature: temperature,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ 
          error: `ChatAnywhere API 오류 (${response.status}): ${errText}` 
        });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return res.json({ text: reply, usage });
    } 
    
    // Default: Gemini (Google AI Studio)
    else {
      // Build conversation history for Gemini
      const contents = [];
      for (const m of messages) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }

      const config: any = {
        temperature: Number(temperature) || 0.7,
      };

      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }

      const response = await ai.models.generateContent({
        model: model && model.startsWith("gemini") ? model : "gemini-3.8-flash",
        contents: contents,
        config: config,
      });

      const reply = response.text || "";
      const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };

      return res.json({ text: reply, usage });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message || "서버 내부 오류가 발생했습니다." });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
