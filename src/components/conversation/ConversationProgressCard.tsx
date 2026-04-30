import type { ProgressSummary } from "@/types/domain";

import ConversationSidebarCard from "./ConversationSidebarCard";

interface ConversationProgressCardProps {
  progress: ProgressSummary;
}

function formatLevelLabel(level: string): string {
  return level
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export default function ConversationProgressCard({
  progress,
}: ConversationProgressCardProps) {
  const scoreFormatter = new Intl.NumberFormat("id-ID");

  return (
    <ConversationSidebarCard title="Progress Kamu">
      <div className="conversation-metric">
        <span>Current streak</span>
        <strong>{progress.currentStreak} hari</strong>
      </div>
      <div className="conversation-metric">
        <span>Total sesi</span>
        <strong>{scoreFormatter.format(progress.totalSessions)}</strong>
      </div>
      <div className="conversation-metric">
        <span>Waktu belajar</span>
        <strong>{scoreFormatter.format(progress.totalStudyMinutes)} menit</strong>
      </div>
      <div className="conversation-metric">
        <span>Estimated level</span>
        <strong>{formatLevelLabel(progress.estimatedLevel)}</strong>
      </div>
    </ConversationSidebarCard>
  );
}
