import type {
  ConversationMessage,
  GrammarCorrection,
} from "@/types/domain";

interface TranscriptPanelProps {
  messages: ConversationMessage[];
  correction: GrammarCorrection | null;
}

export default function TranscriptPanel({
  messages,
  correction,
}: TranscriptPanelProps) {
  return (
    <div className="conversation-transcript">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`chat-bubble${isUser ? " user" : ""}`}
          >
            <div className={`avatar ${isUser ? "avatar-user" : "avatar-ai"}`}>
              {isUser ? "K" : "AI"}
            </div>
            <div className="bubble-content">
              <div className="bubble-name">{message.speaker}</div>
              <div className={`bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
                {message.text}
              </div>
            </div>
          </div>
        );
      })}

      {correction ? (
        <div className="correction-box">
          <div className="correction-icon">!</div>
          <div className="correction-text">
            <div className="correction-label">Koreksi Grammar</div>
            <div className="correction-detail">
              <strong>{correction.original}</strong> -&gt;{" "}
              <strong>{correction.corrected}</strong> - {correction.explanation}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
