import type { LeaderboardEntry } from "@/types/domain";

import ConversationSidebarCard from "./ConversationSidebarCard";

interface ConversationLeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
}

export default function ConversationLeaderboardCard({
  leaderboard,
}: ConversationLeaderboardCardProps) {
  const scoreFormatter = new Intl.NumberFormat("id-ID");

  return (
    <ConversationSidebarCard title="Leaderboard Mingguan">
      <div className="lb-list">
        {leaderboard.map((entry) => (
          <div
            key={`${entry.rank}-${entry.displayName}`}
            className={`lb-row${entry.isCurrentUser ? " you" : ""}`}
          >
            <span className="lb-rank">{entry.rank}</span>
            <div className="lb-avatar">{entry.initials}</div>
            <span className="lb-name">{entry.displayName}</span>
            <span className="lb-score">{scoreFormatter.format(entry.score)} poin</span>
          </div>
        ))}
      </div>
    </ConversationSidebarCard>
  );
}
