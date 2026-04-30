import { generateRealtimeConversation } from "@/services/realtimeConversationService";
import type {
  ConversationHistoryMessagePayload,
  ConversationMode,
  RealtimeConversationRequestPayload,
} from "@/types/domain";

function isConversationMode(value: unknown): value is ConversationMode {
  return value === "guided" || value === "free";
}

function parseHistoryItem(item: unknown): ConversationHistoryMessagePayload | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const candidate = item as { role?: unknown; text?: unknown };

  if (
    (candidate.role !== "assistant" && candidate.role !== "user") ||
    typeof candidate.text !== "string"
  ) {
    return null;
  }

  const text = candidate.text.trim();

  if (!text) {
    return null;
  }

  return {
    role: candidate.role,
    text,
  };
}

function normalizePayload(
  body: unknown,
): RealtimeConversationRequestPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as {
    mode?: unknown;
    topicTitle?: unknown;
    userText?: unknown;
    history?: unknown;
  };

  if (!isConversationMode(payload.mode)) {
    return null;
  }

  if (typeof payload.topicTitle !== "string" || typeof payload.userText !== "string") {
    return null;
  }

  const historyArray = Array.isArray(payload.history) ? payload.history : [];
  const history = historyArray
    .map(parseHistoryItem)
    .filter((item): item is ConversationHistoryMessagePayload => item !== null);

  return {
    mode: payload.mode,
    topicTitle: payload.topicTitle.trim(),
    userText: payload.userText.trim(),
    history,
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const json: unknown = await request.json();
    const payload = normalizePayload(json);

    if (!payload || !payload.userText) {
      return Response.json(
        { error: "Payload tidak valid." },
        {
          status: 400,
        },
      );
    }

    const result = await generateRealtimeConversation(payload);

    return Response.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Terjadi kesalahan saat memproses request conversation." },
      {
        status: 500,
      },
    );
  }
}
