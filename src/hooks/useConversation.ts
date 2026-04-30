"use client";

import { useCallback, useState } from "react";

import { useSpeechToText } from "@/hooks/useSpeechToText";
import {
  buildAssistantReply,
  detectBasicGrammarCorrection,
} from "@/services/grammarService";
import type {
  ConversationMessage,
  ConversationScreenModel,
  ConversationRole,
  GrammarCorrection,
  RealtimeConversationRequestPayload,
  RealtimeConversationResponsePayload,
} from "@/types/domain";

function createMessage(
  role: ConversationRole,
  speaker: string,
  text: string,
): ConversationMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    speaker,
    text,
  };
}

function isGrammarCorrection(value: unknown): value is GrammarCorrection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    original?: unknown;
    corrected?: unknown;
    explanation?: unknown;
  };

  return (
    typeof candidate.original === "string" &&
    typeof candidate.corrected === "string" &&
    typeof candidate.explanation === "string"
  );
}

export function useConversation(model: ConversationScreenModel) {
  const {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    error,
    startListening,
    stopListening,
  } = useSpeechToText("en-US");

  const [messages, setMessages] = useState<ConversationMessage[]>(model.messages);
  const [activeTopicTitle, setActiveTopicTitle] = useState(model.activeTopic.title);
  const [correction, setCorrection] = useState<GrammarCorrection | null>(
    model.correction,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const draftTranscript = transcript;
  const setDraftTranscript = useCallback(
    (value: string) => {
      setTranscript(value);
    },
    [setTranscript],
  );

  const submitUserSentence = useCallback(
    async (rawSentence: string) => {
      const sentence = rawSentence.trim();

      if (!sentence) {
        return;
      }

      const localCorrection = detectBasicGrammarCorrection(sentence);
      const localReply = buildAssistantReply(sentence, localCorrection);
      const historyPayload = messages.map((message) => ({
        role: message.role,
        text: message.text,
      }));
      const payload: RealtimeConversationRequestPayload = {
        mode: model.mode,
        topicTitle: activeTopicTitle,
        userText: sentence,
        history: historyPayload,
      };

      setSubmitError(null);
      setCorrection(null);
      setMessages((prevMessages) => [
        ...prevMessages,
        createMessage("user", "Kamu", sentence),
      ]);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Conversation API gagal (${response.status}).`);
        }

        const data =
          (await response.json()) as Partial<RealtimeConversationResponsePayload>;
        const assistantReply =
          typeof data.assistantMessage === "string" && data.assistantMessage.trim()
            ? data.assistantMessage.trim()
            : localReply;
        const nextCorrection = isGrammarCorrection(data.correction)
          ? data.correction
          : localCorrection;

        setMessages((prevMessages) => [
          ...prevMessages,
          createMessage("assistant", "SpeakEasy AI", assistantReply),
        ]);
        setCorrection(nextCorrection);
      } catch {
        setMessages((prevMessages) => [
          ...prevMessages,
          createMessage("assistant", "SpeakEasy AI", localReply),
        ]);
        setCorrection(localCorrection);
        setSubmitError(
          "Gagal menghubungi AI realtime. Sistem sementara pakai mode fallback.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeTopicTitle, messages, model.mode],
  );

  const submitDraftTranscript = useCallback(() => {
    const sentence = draftTranscript;
    setTranscript("");
    stopListening();
    void submitUserSentence(sentence);
  }, [draftTranscript, setTranscript, stopListening, submitUserSentence]);

  const selectTopic = useCallback((title: string) => {
    setActiveTopicTitle(title);
    setCorrection(null);
    setSubmitError(null);

    setMessages((prevMessages) => [
      ...prevMessages,
      createMessage(
        "assistant",
        "SpeakEasy AI",
        `Topik baru dipilih: ${title}. Mulai dengan satu kalimat perkenalan tentang pengalamanmu.`,
      ),
    ]);
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }, [isListening, isSupported, startListening, stopListening]);

  return {
    activeTopicTitle,
    messages,
    correction,
    draftTranscript,
    setDraftTranscript,
    isListening,
    isSpeechSupported: isSupported,
    speechError: error,
    submitError,
    isSubmitting,
    toggleListening,
    submitDraftTranscript,
    selectTopic,
  };
}
