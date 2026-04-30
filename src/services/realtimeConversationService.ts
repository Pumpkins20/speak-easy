import {
  buildSystemPrompt,
  getGroqRuntimeConfig,
  requestGroqChatCompletion,
  type GroqChatMessage,
} from "@/lib/groq";
import {
  buildAssistantReply,
  detectBasicGrammarCorrection,
} from "@/services/grammarService";
import type {
  ConversationHistoryMessagePayload,
  ConversationMode,
  GrammarCorrection,
  RealtimeConversationResponsePayload,
} from "@/types/domain";

interface RealtimeConversationInput {
  mode: ConversationMode;
  topicTitle: string;
  userText: string;
  history: ConversationHistoryMessagePayload[];
}

const MAX_HISTORY_ITEMS = 8;

function sanitizeHistory(
  history: ConversationHistoryMessagePayload[],
): ConversationHistoryMessagePayload[] {
  return history
    .filter((item) => {
      return (
        (item.role === "assistant" || item.role === "user") &&
        typeof item.text === "string" &&
        item.text.trim().length > 0
      );
    })
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      text: item.text.trim(),
    }));
}

function buildConversationMessages(
  input: RealtimeConversationInput,
): GroqChatMessage[] {
  const systemMessage: GroqChatMessage = {
    role: "system",
    content: [
      buildSystemPrompt(input.mode),
      `Topik aktif: ${input.topicTitle}.`,
      "Respons harus singkat (maksimal 2 kalimat), suportif, dan membantu user lanjut bicara.",
      "Gunakan Bahasa Inggris untuk percakapan utama.",
    ].join("\n"),
  };

  const historyMessages: GroqChatMessage[] = sanitizeHistory(input.history).map(
    (item) => ({
      role: item.role,
      content: item.text,
    }),
  );

  const userMessage: GroqChatMessage = {
    role: "user",
    content: input.userText,
  };

  return [systemMessage, ...historyMessages, userMessage];
}

function buildGrammarMessages(input: RealtimeConversationInput): GroqChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are an English grammar correction engine for Indonesian learners.",
        "Return strict JSON only.",
        'Format: {"hasIssue":boolean,"corrected":string,"explanation":string}',
        "Use Indonesian for explanation.",
        "If sentence is already correct, set hasIssue=false and keep corrected identical to original.",
      ].join("\n"),
    },
    {
      role: "user",
      content: `Original sentence: ${input.userText}`,
    },
  ];
}

function extractJsonFromText(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  const noFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = noFence.indexOf("{");
  const lastBrace = noFence.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return noFence.slice(firstBrace, lastBrace + 1);
}

function parseGrammarCorrection(
  original: string,
  rawResult: string,
): GrammarCorrection | null {
  const rawJson = extractJsonFromText(rawResult);

  if (!rawJson) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawJson);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const data = parsed as {
      hasIssue?: unknown;
      corrected?: unknown;
      explanation?: unknown;
    };

    const hasIssue = Boolean(data.hasIssue);
    const corrected =
      typeof data.corrected === "string" ? data.corrected.trim() : "";
    const explanation =
      typeof data.explanation === "string" ? data.explanation.trim() : "";

    if (!hasIssue || !corrected || !explanation) {
      return null;
    }

    return {
      original,
      corrected,
      explanation,
    };
  } catch {
    return null;
  }
}

function buildFallbackResponse(
  sentence: string,
): RealtimeConversationResponsePayload {
  const correction = detectBasicGrammarCorrection(sentence);

  return {
    assistantMessage: buildAssistantReply(sentence, correction),
    correction,
    source: "fallback",
  };
}

export async function generateRealtimeConversation(
  input: RealtimeConversationInput,
): Promise<RealtimeConversationResponsePayload> {
  const sentence = input.userText.trim();

  if (!sentence) {
    return {
      assistantMessage: "Coba kirim satu kalimat agar kita bisa lanjut latihan.",
      correction: null,
      source: "fallback",
    };
  }

  const config = getGroqRuntimeConfig();

  if (!config.apiKey) {
    return buildFallbackResponse(sentence);
  }

  try {
    const [assistantMessage, grammarRaw] = await Promise.all([
      requestGroqChatCompletion(buildConversationMessages(input), {
        model: config.conversationModel,
        temperature: 0.7,
        maxTokens: 280,
      }),
      requestGroqChatCompletion(buildGrammarMessages(input), {
        model: config.grammarModel,
        temperature: 0.1,
        maxTokens: 220,
      }),
    ]);

    const correction =
      parseGrammarCorrection(sentence, grammarRaw) ??
      detectBasicGrammarCorrection(sentence);

    return {
      assistantMessage,
      correction,
      source: "groq",
    };
  } catch (error) {
    console.error("Realtime conversation fallback:", error);
    return buildFallbackResponse(sentence);
  }
}
