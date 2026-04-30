import Link from "next/link";

import type { DashboardViewModel } from "@/types/domain";

interface DashboardPageProps {
  model: DashboardViewModel;
}

const scoreFormatter = new Intl.NumberFormat("id-ID");

function formatLevelLabel(level: string): string {
  return level
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatLastSeen(isoDate: string): string {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage({ model }: DashboardPageProps) {
  return (
    <div className="dashboard-page">
      <header className="conversation-nav">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot"></span>
          SpeakEasy
        </Link>
        <span className="conversation-nav-caption">Learning Dashboard</span>
      </header>

      <div className="dashboard-shell">
        <section className="dashboard-main">
          <div className="dashboard-head">
            <h1 className="dashboard-title">Dashboard Belajar</h1>
            <p className="dashboard-subtitle">
              Pantau progres harianmu, lihat total sesi, dan review vocabulary
              yang sudah kamu kumpulkan.
            </p>
          </div>

          <div className="dashboard-stats-grid">
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Current Streak</span>
              <strong className="dashboard-stat-value">
                {scoreFormatter.format(model.progress.currentStreak)} hari
              </strong>
            </article>

            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Total Sesi</span>
              <strong className="dashboard-stat-value">
                {scoreFormatter.format(model.progress.totalSessions)} sesi
              </strong>
            </article>

            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Total Menit</span>
              <strong className="dashboard-stat-value">
                {scoreFormatter.format(model.progress.totalStudyMinutes)} menit
              </strong>
            </article>

            <article className="dashboard-stat-card">
              <span className="dashboard-stat-label">Estimated Level</span>
              <strong className="dashboard-stat-value">
                {formatLevelLabel(model.progress.estimatedLevel)}
              </strong>
            </article>
          </div>

          <div className="dashboard-score-pill">
            Weekly score: {scoreFormatter.format(model.progress.weeklyScore)} poin
          </div>

          <div className="dashboard-vocabulary-card">
            <h2 className="dashboard-section-title">Vocabulary Log</h2>

            {model.vocabularyLog.length === 0 ? (
              <p className="dashboard-empty">
                Belum ada vocabulary log. Mulai satu sesi conversation dulu.
              </p>
            ) : (
              <div className="dashboard-vocabulary-list">
                {model.vocabularyLog.map((entry) => (
                  <article
                    key={`${entry.word}-${entry.lastSeenAt}`}
                    className="dashboard-vocab-item"
                  >
                    <div className="dashboard-vocab-head">
                      <strong>{entry.word}</strong>
                      <span>{formatLastSeen(entry.lastSeenAt)}</span>
                    </div>
                    <p className="dashboard-vocab-meaning">{entry.meaning}</p>
                    {entry.example ? (
                      <p className="dashboard-vocab-example">
                        &quot;{entry.example}&quot;
                      </p>
                    ) : null}
                    {entry.sourceTopic ? (
                      <span className="topic-chip-tag">{entry.sourceTopic}</span>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-sidebar">
          <div className="conversation-card">
            <h2 className="conversation-card-title">Riwayat Topik</h2>
            <div className="topic-mini">
              {model.topicHistory.map((item) => (
                <div
                  key={`${item.title}-${item.label}`}
                  className={`topic-chip${item.isToday ? " active" : ""}`}
                >
                  {item.title}
                  <span className="topic-chip-tag">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="conversation-card">
            <h2 className="conversation-card-title">Leaderboard</h2>
            <div className="lb-list">
              {model.leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.displayName}`}
                  className={`lb-row${entry.isCurrentUser ? " you" : ""}`}
                >
                  <span className="lb-rank">{entry.rank}</span>
                  <div className="lb-avatar">{entry.initials}</div>
                  <span className="lb-name">{entry.displayName}</span>
                  <span className="lb-score">
                    {scoreFormatter.format(entry.score)} poin
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/conversation" className="btn-primary dashboard-cta-link">
            Lanjut Sesi Conversation
          </Link>
        </aside>
      </div>
    </div>
  );
}
