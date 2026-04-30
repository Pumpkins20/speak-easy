import Link from "next/link";

import BentoCard from "@/components/landing/BentoCard";
import FadeInObserver from "@/components/landing/FadeInObserver";
import HowStepCard from "@/components/landing/HowStepCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LandingViewModel, StreakCellState } from "@/types/domain";

interface LandingPageProps {
  model: LandingViewModel;
}

const waveformBars = Array.from({ length: 10 });
const streakLabels = ["Sen", "Min"];
const scoreFormatter = new Intl.NumberFormat("id-ID");

function getStreakCellClassName(state: StreakCellState): string {
  if (state === "active") {
    return "streak-cell active";
  }

  if (state === "partial") {
    return "streak-cell partial";
  }

  return "streak-cell";
}

export default function LandingPage({ model }: LandingPageProps) {
  return (
    <>
      <FadeInObserver />

      <nav>
        <a href="#" className="nav-logo">
          <span className="nav-logo-dot"></span>
          SpeakEasy
        </a>
        <ul className="nav-links">
          <li>
            <a href="#cara-kerja">Cara Kerja</a>
          </li>
          <li>
            <a href="#fitur">Fitur</a>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Button asChild variant="unstyled" size="unstyled" className="nav-cta">
              <Link href="/conversation">Mulai Gratis</Link>
            </Button>
          </li>
        </ul>
      </nav>

      <div className="hero">
        <div className="hero-glow"></div>

        <div className="hero-content">
          <div className="brand-reveal" aria-hidden="true">
            SpeakEasy
          </div>

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Teman ngobrol bahasa Inggris yang selalu ada
          </div>

          <h1 className="hero-title">
            bicara.
            <br />
            <span className="hero-highlight">langsung lancar</span>.
          </h1>

          <p className="hero-sub">
            Latihan conversation bahasa Inggris bersama AI kapan saja, tanpa
            rasa malu, tanpa biaya.
          </p>

          <div className="hero-actions">
            <Button asChild variant="unstyled" size="unstyled" className="btn-primary">
              <Link href="/conversation">
                Coba Sekarang - Gratis
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
              </Link>
            </Button>
            <a href="#cara-kerja" className="btn-ghost">
              Lihat cara kerjanya
            </a>
          </div>
        </div>

        <div className="hero-demo">
          <Card className="demo-card">
            <div className="demo-topbar">
              <div className="demo-dots">
                <div className="demo-dot"></div>
                <div className="demo-dot"></div>
                <div className="demo-dot"></div>
              </div>
              <span className="demo-title">Sesi Conversation - Topik Harian</span>
              <div className="demo-status">
                <span className="demo-status-dot"></span>
                Live
              </div>
            </div>
            <div className="demo-body">
              <div className="demo-topic-pill">
                📅 Topik hari ini: {model.heroTopic.title}
              </div>

              {model.heroMessages.map((message) => {
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

              <div className="correction-box">
                <div className="correction-icon">!</div>
                <div className="correction-text">
                  <div className="correction-label">Koreksi Grammar</div>
                  <div className="correction-detail">
                    <strong>{model.heroCorrection.original}</strong> -&gt;{" "}
                    <strong>{model.heroCorrection.corrected}</strong> -{" "}
                    {model.heroCorrection.explanation}
                  </div>
                </div>
              </div>

              <div className="demo-mic">
                <div className="waveform" aria-hidden="true">
                  {waveformBars.map((_, index) => (
                    <div key={`left-${index}`} className="wave-bar"></div>
                  ))}
                </div>
                <div className="mic-btn" aria-hidden="true">
                  <svg className="mic-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 7a1 1 0 0 1 1 1 8 8 0 0 1-7 7.93V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A8 8 0 0 1 4 11a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
                  </svg>
                </div>
                <div
                  className="waveform"
                  style={{ transform: "scaleX(-1)" }}
                  aria-hidden="true"
                >
                  {waveformBars.map((_, index) => (
                    <div key={`right-${index}`} className="wave-bar"></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <hr className="full-sep" />

      <section id="cara-kerja">
        <div className="fade-in">
          <div className="section-label">Cara Kerja</div>
          <h2 className="section-title">
            Sesederhana
            <br />
            ngobrol biasa.
          </h2>
          <p className="section-sub">
            Tidak ada tes, tidak ada registrasi dulu. Buka, pilih topik, dan
            langsung bicara.
          </p>
        </div>

        <div className="how-grid fade-in">
          {model.workflow.map((step) => (
            <HowStepCard key={step.number} step={step} />
          ))}
        </div>
      </section>

      <hr className="full-sep" />

      <section id="fitur">
        <div className="fade-in">
          <div className="section-label">Fitur</div>
          <h2 className="section-title">
            Semua yang kamu
            <br />
            butuhkan untuk lancar.
          </h2>
        </div>

        <div className="bento fade-in">
          <BentoCard
            className="tall"
            icon="🔥"
            iconStyle={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
            }}
            title="Streak & Progress"
            description="Bangun kebiasaan belajar harian. Streak-mu tercatat dan menantangmu untuk terus konsisten."
          >
            <div className="streak-visual">
              {model.progress.streakCalendar.map((row, rowIndex) => (
                <div className="streak-row" key={`row-${rowIndex}`}>
                  <span className="streak-label">{streakLabels[rowIndex]}</span>
                  {row.map((cellState, cellIndex) => (
                    <div
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={getStreakCellClassName(cellState)}
                    ></div>
                  ))}
                </div>
              ))}
            </div>

            <div className="streak-count">
              <span className="streak-num">{model.progress.currentStreak}</span>
              <span className="streak-unit">hari berturut-turut</span>
            </div>
          </BentoCard>

          <BentoCard
            className="wide"
            icon="🎯"
            iconStyle={{ background: "var(--blue-dim)", color: "var(--blue)" }}
            title="Topik Harian yang Personal"
            description="AI memilih topik berbeda setiap hari khusus untukmu berdasarkan apa yang sudah kamu pelajari dan area yang perlu diperkuat."
          >
            <div className="topic-mini">
              {model.topicHistory.map((topic) => (
                <div
                  key={topic.title}
                  className={`topic-chip${topic.isToday ? " active" : ""}`}
                >
                  {topic.title}
                  <span className="topic-chip-tag">{topic.label}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            icon="✗→✓"
            iconStyle={{
              background: "rgba(232, 104, 90, 0.1)",
              color: "var(--red)",
            }}
            title="Koreksi Grammar Instan"
            description="Selesai 1 kalimat, koreksi langsung muncul. Penjelasan dalam Bahasa Indonesia, jelas dan tidak menggurui."
          />

          <BentoCard
            icon="🏆"
            iconStyle={{
              background: "rgba(255, 200, 80, 0.1)",
              color: "#e8b84b",
            }}
            title="Leaderboard Global"
            description="Bersaing dengan pelajar dari seluruh Indonesia. Weekly reset tiap Senin dan semua punya kesempatan yang sama."
          >
            <div className="lb-list">
              {model.leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.displayName}`}
                  className={`lb-row${entry.isCurrentUser ? " you" : ""}`}
                >
                  <span className="lb-rank">{entry.rank}</span>
                  <div
                    className="lb-avatar"
                    style={
                      entry.isCurrentUser
                        ? {
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                          }
                        : undefined
                    }
                  >
                    {entry.initials}
                  </div>
                  <span className="lb-name">{entry.displayName}</span>
                  <span className="lb-score">
                    {scoreFormatter.format(entry.score)} poin
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            className="wide"
            icon="🎙"
            iconStyle={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
            }}
            title="Voice First - Bicara, Bukan Mengetik"
            description="Interaksi utama lewat suara. AI merespons dengan suara natural karena speaking skill hanya bisa diasah lewat speaking sungguhan."
          />
        </div>
      </section>

      <hr className="full-sep" />

      <div className="cta-section" id="mulai">
        <div className="cta-bg"></div>
        <div className="cta-inner fade-in">
          <div className="section-label" style={{ marginBottom: "24px" }}>
            Mulai Sekarang
          </div>
          <h2 className="cta-title">
            Conversation
            <br />
            pertamamu.
            <br />
            <em>Hari ini.</em>
          </h2>
          <p className="cta-sub">
            Tidak perlu daftar. Tidak perlu download. Buka browser dan langsung
            bicara.
          </p>
          <Button
            asChild
            variant="unstyled"
            size="unstyled"
            className="btn-primary"
            style={{ fontSize: "16px", padding: "16px 40px" }}
          >
            <Link href="/conversation">
              Mulai Gratis - Tanpa Daftar
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
            </Link>
          </Button>
          <p className="cta-note">
            Gratis selamanya untuk fitur dasar - Tidak perlu kartu kredit
          </p>
        </div>
      </div>

      <hr className="full-sep" />

      <footer>
        <span className="footer-logo">SpeakEasy AI</span>
        <span className="footer-copy">
          © 2026 SpeakEasy AI - Dibuat dengan hati di Indonesia
        </span>
      </footer>
    </>
  );
}
