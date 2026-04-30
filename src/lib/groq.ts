import type { ConversationMode, GroqRuntimeConfig } from "@/types/domain";

export type GroqChatRole = "system" | "assistant" | "user";

export interface GroqChatMessage {
  role: GroqChatRole;
  content: string;
}

interface GroqChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export function getGroqRuntimeConfig(): GroqRuntimeConfig {
  return {
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
    conversationModel:
      process.env.GROQ_CONVERSATION_MODEL ?? "llama-3.3-70b-versatile",
    grammarModel: process.env.GROQ_GRAMMAR_MODEL ?? "llama-3.1-8b-instant",
  };
}

export function buildSystemPrompt(mode: ConversationMode): string {
  if (mode === "free") {
    return "Kamu adalah partner conversation bahasa Inggris yang sabar. Gunakan Bahasa Indonesia untuk feedback, dan Bahasa Inggris untuk simulasi percakapan.";
  }

  return "Kamu adalah tutor conversation bahasa Inggris untuk pemula Indonesia. Berikan topik terstruktur, koreksi grammar ringkas dalam Bahasa Indonesia, dan tone yang suportif.";
}

export async function requestGroqChatCompletion(
  messages: GroqChatMessage[],
  options: GroqChatCompletionOptions = {},
): Promise<string> {
  const config = getGroqRuntimeConfig();

  if (!config.apiKey) {
    throw new Error("GROQ_API_KEY belum dikonfigurasi.");
  }

  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const payload = {
    model: options.model ?? config.conversationModel,
    messages,
    temperature: options.temperature ?? 0.5,
    max_tokens: options.maxTokens ?? 280,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Groq request gagal (${response.status}): ${errorBody.slice(0, 240)}`,
    );
  }

  const data = (await response.json()) as GroqChatCompletionResponse;
  const message = data.choices?.[0]?.message?.content?.trim();

  if (!message) {
    throw new Error("Groq tidak mengembalikan konten respons.");
  }

  return message;
}
