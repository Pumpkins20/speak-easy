"use client";

import Link from "next/link";

import ConversationLeaderboardCard from "@/components/conversation/ConversationLeaderboardCard";
import MicButton from "@/components/conversation/MicButton";
import ConversationProgressCard from "@/components/conversation/ConversationProgressCard";
import ConversationTopicCard from "@/components/conversation/ConversationTopicCard";
import TranscriptPanel from "@/components/conversation/TranscriptPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConversation } from "@/hooks/useConversation";
import type { ConversationScreenModel } from "@/types/domain";

interface ConversationClientProps {
  model: ConversationScreenModel;
}

const waveformBars = Array.from({ length: 10 });

export default function ConversationClient({ model }: ConversationClientProps) {
  const {
    activeTopicTitle,
    messages,
    correction,
    draftTranscript,
    setDraftTranscript,
    isListening,
    isSpeechSupported,
    speechError,
    submitError,
    isSubmitting,
    toggleListening,
    submitDraftTranscript,
    selectTopic,
  } = useConversation(model);

  return (
    <div className="conversation-page">
      <header className="conversation-nav">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot"></span>
          SpeakEasy
        </Link>
        <span className="conversation-nav-caption">Mode Guided Topic</span>
      </header>

      <div className="conversation-shell">
        <Card className="conversation-main">
          <div className="conversation-main-head">
            <h1 className="conversation-title">Latihan Conversation</h1>
            <p className="conversation-subtitle">
              Bicara bebas, dapat koreksi grammar langsung dalam Bahasa
              Indonesia.
            </p>
          </div>

          <Badge variant="unstyled" className="demo-topic-pill">
            🎯 Topik aktif: {activeTopicTitle}
          </Badge>

          <TranscriptPanel messages={messages} correction={correction} />

          <div className="conversation-controls">
            <div className="waveform" aria-hidden="true">
              {waveformBars.map((_, index) => (
                <div key={`left-${index}`} className="wave-bar"></div>
              ))}
            </div>

            <MicButton
              isActive={isListening}
              disabled={!isSpeechSupported}
              onClick={toggleListening}
            />

            <div
              className="waveform conversation-waveform-mirror"
              aria-hidden="true"
            >
              {waveformBars.map((_, index) => (
                <div key={`right-${index}`} className="wave-bar"></div>
              ))}
            </div>
          </div>

          <div className="conversation-draft">
            <Label
              htmlFor="draft-input"
              className="conversation-draft-label"
              variant="unstyled"
            >
              Transkrip kamu
            </Label>
            <Textarea
              id="draft-input"
              variant="unstyled"
              className="conversation-draft-input"
              value={draftTranscript}
              onChange={(event) => setDraftTranscript(event.target.value)}
              placeholder={
                isSpeechSupported
                  ? "Ucapkan kalimatmu atau ketik manual..."
                  : "Browser ini belum mendukung speech recognition. Silakan ketik manual."
              }
            />
          </div>

          <div className="conversation-actions">
            <Button
              type="button"
              className="btn-primary conversation-submit"
              variant="unstyled"
              size="unstyled"
              onClick={submitDraftTranscript}
              disabled={!draftTranscript.trim() || isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Kirim Kalimat"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>

            <p className="conversation-note">
              {submitError
                ? submitError
                : speechError
                ? speechError
                : isSpeechSupported
                  ? "Tips: tekan mic, bicara satu kalimat, lalu klik Kirim Kalimat."
                  : "Speech-to-text belum tersedia di browser ini, tapi kamu tetap bisa latihan dengan mengetik."}
            </p>
          </div>
        </Card>

        <aside className="conversation-sidebar">
          <ConversationTopicCard
            topics={model.topicRecommendations}
            activeTopicTitle={activeTopicTitle}
            onSelect={selectTopic}
          />
          <ConversationProgressCard progress={model.progress} />
          <ConversationLeaderboardCard leaderboard={model.leaderboard} />
        </aside>
      </div>
    </div>
  );
}
