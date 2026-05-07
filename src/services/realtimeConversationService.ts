import curriculumSeed from "@/docs/seeds/a1_curriculum.json";
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
  SessionGamification,
} from "@/types/domain";

interface RealtimeConversationInput {
  mode: ConversationMode;
  topicId?: string;
  topicTitle: string;
  userText: string;
  history: ConversationHistoryMessagePayload[];
}

interface CurriculumTopic {
  topic_id: string;
  title: string;
  target_grammar: string[];
  target_vocabulary: string[];
  scenario_prompt: string;
}

const MAX_HISTORY_ITEMS = 8;
const VOCABULARY_BONUS_THRESHOLD = 2;
const VOCABULARY_BONUS_POINTS = 20;
const curriculumTopics = curriculumSeed as CurriculumTopic[];

function getCurriculumTopic(input: RealtimeConversationInput): CurriculumTopic | null {
  const normalizedTopicId = input.topicId?.trim().toLowerCase();
  const normalizedTitle = input.topicTitle.trim().toLowerCase();

  const byId = normalizedTopicId
    ? curriculumTopics.find((topic) => topic.topic_id.toLowerCase() === normalizedTopicId)
    : null;

  if (byId) {
    return byId;
  }

  return (
    curriculumTopics.find((topic) => topic.title.trim().toLowerCase() === normalizedTitle) ??
    null
  );
}

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

function extractTargetVocabularyUsage(sentence: string, targetVocabulary: string[]): string[] {
  const normalizedSentence = sentence.toLowerCase();

  return targetVocabulary
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
    .filter((word) => normalizedSentence.includes(word))
    .filter((word, index, array) => array.indexOf(word) === index);
}

function buildGamification(
  sentence: string,
  targetVocabulary: string[],
): SessionGamification {
  const matchedVocabulary = extractTargetVocabularyUsage(sentence, targetVocabulary);
  const bonusAwarded = matchedVocabulary.length >= VOCABULARY_BONUS_THRESHOLD;

  return {
    matchedVocabulary,
    bonusAwarded,
    bonusPoints: bonusAwarded ? VOCABULARY_BONUS_POINTS : 0,
  };
}

function buildConversationMessages(
  input: RealtimeConversationInput,
): GroqChatMessage[] {
  const topic = getCurriculumTopic(input);
  const systemMessage: GroqChatMessage = {
    role: "system",
    content: [
      buildSystemPrompt(input.mode, {
        scenarioPrompt: topic?.scenario_prompt,
      }),
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
  const topic = getCurriculumTopic(input);

  return [
    {
      role: "system",
      content: [
        "You are an English grammar correction engine for Indonesian learners.",
        "Koreksi harus terasa humanis: apresiasi dulu, lalu beri 1 fokus koreksi paling penting saja.",
        "Jangan menghakimi. Hindari kata-kata keras seperti salah total atau buruk.",
        "Jika kalimat sudah cukup benar, berikan validasi singkat dan saran kecil agar lebih natural.",
        "Return strict JSON only.",
        'Format: {"hasIssue":boolean,"corrected":string,"explanation":string}',
        "Use Indonesian for explanation.",
        topic
          ? `Prioritaskan koreksi terkait target grammar topik ini: ${topic.target_grammar.join(", ")}.`
          : "",
        "If sentence is already correct, set hasIssue=false and keep corrected identical to original.",
      ]
        .filter(Boolean)
        .join("\n"),
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

    const hasUsefulCorrection =
      corrected.length > 0 &&
      explanation.length > 0 &&
      corrected.toLowerCase() !== original.trim().toLowerCase();

    if ((!hasIssue && !hasUsefulCorrection) || !corrected || !explanation) {
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
  gamification: SessionGamification,
): RealtimeConversationResponsePayload {
  const correction = detectBasicGrammarCorrection(sentence);

  return {
    assistantMessage: buildAssistantReply(sentence, correction),
    correction,
    gamification,
    source: "fallback",
  };
}

export async function generateRealtimeConversation(
  input: RealtimeConversationInput,
): Promise<RealtimeConversationResponsePayload> {
  const sentence = input.userText.trim();
  const topic = getCurriculumTopic(input);
  const gamification = buildGamification(
    sentence,
    topic?.target_vocabulary ?? [],
  );

  if (!sentence) {
    return {
      assistantMessage: "Coba kirim satu kalimat agar kita bisa lanjut latihan.",
      correction: null,
      gamification,
      source: "fallback",
    };
  }

  const config = getGroqRuntimeConfig();

  if (!config.apiKey) {
    return buildFallbackResponse(sentence, gamification);
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
      gamification,
      source: "groq",
    };
  } catch (error) {
    console.error("Realtime conversation fallback:", error);
    return buildFallbackResponse(sentence, gamification);
  }
}
