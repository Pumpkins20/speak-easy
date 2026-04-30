import {
  getSupabaseRuntimeConfig,
  getSupabaseServerClient,
} from "@/lib/supabase";
import { detectEstimatedLevel } from "@/services/levelDetectionService";
import type {
  ConversationMessage,
  DailyTopic,
  DailyTopicHistoryItem,
  GrammarCorrection,
  LeaderboardEntry,
  ProgressSummary,
  StreakCellState,
  VocabularyLogEntry,
  WorkflowStep,
} from "@/types/domain";

interface RepositorySnapshot {
  topic: DailyTopic;
  messages: ConversationMessage[];
  correction: GrammarCorrection;
  workflow: WorkflowStep[];
  topicHistory: DailyTopicHistoryItem[];
  leaderboard: LeaderboardEntry[];
  progress: ProgressSummary;
}

interface DashboardSnapshot {
  progress: ProgressSummary;
  topicHistory: DailyTopicHistoryItem[];
  leaderboard: LeaderboardEntry[];
  vocabularyLog: VocabularyLogEntry[];
}

export interface SpeakeasyRepository {
  getLandingSnapshot(): Promise<RepositorySnapshot>;
  getConversationSnapshot(): Promise<RepositorySnapshot>;
  getDashboardSnapshot(): Promise<DashboardSnapshot>;
}

type UnknownRow = Record<string, unknown>;

const MAX_HISTORY_RECORDS = 120;
const DEFAULT_USER_ID = process.env.SPEAKEASY_DEFAULT_USER_ID ?? "demo-user";

const topic: DailyTopic = {
  id: "topic-intro-work",
  title: "Introducing yourself at work",
  category: "daily-guided",
  starterQuestions: [
    "How do you usually introduce yourself on your first day at work?",
    "What do you do in your role?",
    "What are you most excited to learn this month?",
  ],
};

const messages: ConversationMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    speaker: "SpeakEasy AI",
    text: "Hi! Let's practice introducing yourself. Imagine it's your first day at a new office. How would you introduce yourself to your new colleagues?",
  },
  {
    id: "msg-2",
    role: "user",
    speaker: "Kamu",
    text: "Hello everyone, my name is Kiko. I come from Surakarta and I will work here as a designer since last week.",
  },
  {
    id: "msg-3",
    role: "assistant",
    speaker: "SpeakEasy AI",
    text: "Great start! Small correction noted above. Your pronunciation is clear. Now try adding what you're excited about in this new role!",
  },
];

const correction: GrammarCorrection = {
  original: "I will work here as a designer since last week.",
  corrected: "I have been working here as a designer since last week.",
  explanation:
    "Karena aktivitasnya sudah dimulai pada masa lalu dan masih berlanjut sekarang, gunakan present perfect continuous.",
};

const workflow: WorkflowStep[] = [
  {
    number: "01",
    pill: "Gratis",
    title: "Buka langsung, tanpa daftar",
    description:
      "Tidak perlu akun dulu. Langsung masuk dan mulai sesi percakapan pertamamu dalam hitungan detik.",
  },
  {
    number: "02",
    pill: "AI Personal",
    title: "AI pilihkan topik untukmu",
    description:
      "Setiap hari AI memilih topik berbeda berdasarkan riwayat belajar dan area yang perlu diperkuat.",
  },
  {
    number: "03",
    pill: "Voice",
    title: "Bicara, bukan mengetik",
    description:
      "Kamu bicara via mikrofon, AI mendengarkan dan merespons dengan suara. Rasanya seperti percakapan sungguhan.",
  },
  {
    number: "04",
    pill: "Real-time",
    title: "Koreksi langsung, bukan di akhir",
    description:
      "Setiap selesai satu kalimat, koreksi grammar muncul otomatis dengan penjelasan Bahasa Indonesia.",
  },
];

const topicHistory: DailyTopicHistoryItem[] = [
  {
    title: "Introducing yourself at work",
    label: "Hari ini",
    isToday: true,
  },
  {
    title: "Ordering food at a restaurant",
    label: "Kemarin",
  },
  {
    title: "Asking for directions",
    label: "3 hari lalu",
  },
];

const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    initials: "RS",
    displayName: "Rizky S.",
    score: 1240,
  },
  {
    rank: 2,
    initials: "AN",
    displayName: "Ayu N.",
    score: 1180,
  },
  {
    rank: 7,
    initials: "K",
    displayName: "Kamu",
    score: 870,
    isCurrentUser: true,
  },
];

const progress: ProgressSummary = {
  currentStreak: 12,
  weeklyScore: 870,
  totalSessions: 18,
  totalStudyMinutes: 146,
  estimatedLevel: "beginner",
  streakCalendar: [
    ["active", "active", "active", "active", "partial", "idle", "idle"],
    ["active", "active", "active", "partial", "idle", "idle", "idle"],
  ],
};

const vocabularyLog: VocabularyLogEntry[] = [
  {
    word: "colleague",
    meaning: "rekan kerja",
    example: "I had lunch with my new colleague.",
    sourceTopic: "Introducing yourself at work",
    lastSeenAt: new Date().toISOString(),
  },
  {
    word: "deadline",
    meaning: "batas waktu",
    example: "The deadline is next Friday.",
    sourceTopic: "Introducing yourself at work",
    lastSeenAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    word: "commute",
    meaning: "perjalanan rutin ke tempat kerja",
    example: "My commute takes around 40 minutes.",
    sourceTopic: "Asking for directions",
    lastSeenAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const snapshot: RepositorySnapshot = {
  topic,
  messages,
  correction,
  workflow,
  topicHistory,
  leaderboard,
  progress,
};

const dashboardSnapshot: DashboardSnapshot = {
  progress,
  topicHistory,
  leaderboard,
  vocabularyLog,
};

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function normalizeDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(base: Date, amount: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + amount);
  return next;
}

function getValue(row: UnknownRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in row) {
      return row[key];
    }
  }

  return undefined;
}

function readString(row: UnknownRow, ...keys: string[]): string | undefined {
  const value = getValue(row, ...keys);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function readNumber(row: UnknownRow, ...keys: string[]): number | undefined {
  const value = getValue(row, ...keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function readBoolean(row: UnknownRow, ...keys: string[]): boolean | undefined {
  const value = getValue(row, ...keys);

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function toSafeDateString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const asDate = new Date(value);

  if (Number.isNaN(asDate.getTime())) {
    return undefined;
  }

  return asDate.toISOString();
}

function readDateString(row: UnknownRow, ...keys: string[]): string | undefined {
  return toSafeDateString(getValue(row, ...keys));
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return parseStringArray(parsed);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function buildInitials(displayName: string): string {
  const chunks = displayName
    .split(" ")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    return "NA";
  }

  if (chunks.length === 1) {
    return chunks[0].slice(0, 2).toUpperCase();
  }

  return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase();
}

function relativeLabelFromDate(dateIso?: string, index = 0): string {
  if (!dateIso) {
    return index === 0 ? "Hari ini" : `${index + 1} hari lalu`;
  }

  const targetDate = new Date(dateIso);
  const today = new Date();
  const target = normalizeDateKey(targetDate);
  const current = normalizeDateKey(today);

  if (target === current) {
    return "Hari ini";
  }

  const yesterday = normalizeDateKey(addDays(today, -1));

  if (target === yesterday) {
    return "Kemarin";
  }

  const diffMs = new Date(current).getTime() - new Date(target).getTime();
  const diffDays = Math.max(1, Math.round(diffMs / 86400000));
  return `${diffDays} hari lalu`;
}

function buildStreakCalendar(dateKeys: Set<string>): StreakCellState[][] {
  const cells: StreakCellState[] = [];
  const today = new Date();

  for (let offset = 13; offset >= 0; offset -= 1) {
    const key = normalizeDateKey(addDays(today, -offset));

    if (dateKeys.has(key)) {
      cells.push("active");
      continue;
    }

    if (offset === 0) {
      cells.push("partial");
      continue;
    }

    cells.push("idle");
  }

  return [cells.slice(0, 7), cells.slice(7, 14)];
}

function calculateCurrentStreak(dateKeys: Set<string>): number {
  const today = new Date();
  const todayKey = normalizeDateKey(today);
  const yesterday = addDays(today, -1);
  const yesterdayKey = normalizeDateKey(yesterday);

  let cursor: Date | null = null;

  if (dateKeys.has(todayKey)) {
    cursor = today;
  } else if (dateKeys.has(yesterdayKey)) {
    cursor = yesterday;
  }

  if (!cursor) {
    return 0;
  }

  let streak = 0;

  while (dateKeys.has(normalizeDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function safeRows(data: unknown): UnknownRow[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((item): item is UnknownRow => {
    return Boolean(item) && typeof item === "object" && !Array.isArray(item);
  });
}

function mapDailyTopic(row: UnknownRow | null): DailyTopic {
  if (!row) {
    return topic;
  }

  const starterQuestions = parseStringArray(
    getValue(row, "starter_questions", "starterQuestions", "questions"),
  );

  return {
    id: readString(row, "id", "topic_id") ?? topic.id,
    title: readString(row, "title", "topic_title", "topic") ?? topic.title,
    category: readString(row, "category") ?? topic.category,
    starterQuestions:
      starterQuestions.length > 0 ? starterQuestions : topic.starterQuestions,
  };
}

function mapTopicHistory(rows: UnknownRow[]): DailyTopicHistoryItem[] {
  if (rows.length === 0) {
    return topicHistory;
  }

  const mapped = rows.slice(0, 8).map((row, index) => {
    const dateIso = readDateString(row, "created_at", "session_date", "date");
    const label =
      readString(row, "label") ??
      readString(row, "relative_label") ??
      relativeLabelFromDate(dateIso, index);
    const titleValue =
      readString(row, "title", "topic_title", "topic") ??
      `Topik ${index + 1}`;
    const isToday =
      readBoolean(row, "is_today", "isToday") ?? label === "Hari ini";

    return {
      title: titleValue,
      label,
      isToday,
    };
  });

  return mapped;
}

function mapLeaderboard(rows: UnknownRow[], userId: string): LeaderboardEntry[] {
  if (rows.length === 0) {
    return leaderboard;
  }

  return rows.slice(0, 10).map((row, index) => {
    const displayName =
      readString(row, "display_name", "name", "username") ??
      `User ${index + 1}`;
    const rowUserId = readString(row, "user_id", "uid", "profile_id");

    return {
      rank: readNumber(row, "rank", "position") ?? index + 1,
      initials: readString(row, "initials") ?? buildInitials(displayName),
      displayName,
      score: Math.max(0, Math.round(readNumber(row, "score", "points") ?? 0)),
      isCurrentUser:
        rowUserId === userId ||
        readBoolean(row, "is_current_user", "isCurrentUser") === true,
    };
  });
}

function buildVocabularyFromRows(rows: UnknownRow[]): VocabularyLogEntry[] {
  const logMap = new Map<string, VocabularyLogEntry>();

  rows.forEach((row) => {
    const sourceTopic = readString(row, "title", "topic_title", "topic");
    const lastSeenAt =
      readDateString(row, "created_at", "session_date", "date") ??
      new Date().toISOString();
    const candidate = getValue(row, "vocabulary_log", "vocabulary", "new_words");

    const pushWord = (
      wordRaw: string,
      meaningRaw?: string,
      exampleRaw?: string,
    ) => {
      const word = wordRaw.trim().toLowerCase();

      if (!word) {
        return;
      }

      const current = logMap.get(word);
      const meaning =
        (meaningRaw && meaningRaw.trim()) || current?.meaning || "Kata dari sesi";
      const example =
        (exampleRaw && exampleRaw.trim()) || current?.example || undefined;

      logMap.set(word, {
        word,
        meaning,
        example,
        sourceTopic: sourceTopic ?? current?.sourceTopic,
        lastSeenAt,
      });
    };

    if (Array.isArray(candidate)) {
      candidate.forEach((item) => {
        if (typeof item === "string") {
          pushWord(item);
          return;
        }

        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;
          const word = typeof itemObj.word === "string" ? itemObj.word : "";
          const meaning =
            typeof itemObj.meaning === "string" ? itemObj.meaning : undefined;
          const example =
            typeof itemObj.example === "string" ? itemObj.example : undefined;

          if (word) {
            pushWord(word, meaning, example);
          }
        }
      });
    } else if (typeof candidate === "string") {
      candidate
        .split(",")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .forEach((word) => pushWord(word));
    }
  });

  const entries = Array.from(logMap.values())
    .sort((a, b) => Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt))
    .slice(0, 20);

  return entries.length > 0 ? entries : vocabularyLog;
}

function buildProgressFromRows(
  historyRows: UnknownRow[],
  leaderboardRows: LeaderboardEntry[],
): ProgressSummary {
  if (historyRows.length === 0) {
    return progress;
  }

  const sessionDateKeys = new Set<string>();
  let summedMinutes = 0;
  let summedSessionCount = 0;
  let grammarRateTotal = 0;
  let grammarRateCount = 0;
  let wordsPerSentenceTotal = 0;
  let wordsPerSentenceCount = 0;

  historyRows.forEach((row) => {
    const dateIso = readDateString(row, "created_at", "session_date", "date");

    if (dateIso) {
      sessionDateKeys.add(normalizeDateKey(new Date(dateIso)));
    }

    summedMinutes +=
      readNumber(
        row,
        "session_minutes",
        "study_minutes",
        "duration_minutes",
        "minutes",
      ) ?? 0;

    summedSessionCount += readNumber(row, "session_count") ?? 0;

    const grammarRate = readNumber(row, "grammar_error_rate", "error_rate");

    if (typeof grammarRate === "number") {
      grammarRateTotal += grammarRate;
      grammarRateCount += 1;
    }

    const wordsPerSentence = readNumber(
      row,
      "avg_words_per_sentence",
      "average_words_per_sentence",
    );

    if (typeof wordsPerSentence === "number") {
      wordsPerSentenceTotal += wordsPerSentence;
      wordsPerSentenceCount += 1;
    }
  });

  const totalSessions =
    summedSessionCount > 0 ? Math.round(summedSessionCount) : historyRows.length;
  const totalStudyMinutes =
    summedMinutes > 0 ? Math.round(summedMinutes) : totalSessions * 8;
  const grammarErrorRate =
    grammarRateCount > 0 ? grammarRateTotal / grammarRateCount : 0.22;
  const averageWordsPerSentence =
    wordsPerSentenceCount > 0 ? wordsPerSentenceTotal / wordsPerSentenceCount : 8;

  const currentStreak = calculateCurrentStreak(sessionDateKeys);
  const weeklyScore =
    leaderboardRows.find((entry) => entry.isCurrentUser)?.score ??
    Math.round(totalSessions * 18 + totalStudyMinutes * 1.8);

  return {
    currentStreak,
    weeklyScore,
    totalSessions,
    totalStudyMinutes,
    estimatedLevel: detectEstimatedLevel({
      totalSessions,
      grammarErrorRate,
      averageWordsPerSentence,
    }),
    streakCalendar: buildStreakCalendar(sessionDateKeys),
  };
}

function buildMessagesFromTopic(activeTopic: DailyTopic): ConversationMessage[] {
  return [
    {
      id: "msg-1",
      role: "assistant",
      speaker: "SpeakEasy AI",
      text: `Hi! Topik hari ini: ${activeTopic.title}. ${activeTopic.starterQuestions[0] ?? "How would you start this conversation?"}`,
    },
  ];
}

async function fetchTopicFromCache(): Promise<UnknownRow | null> {
  const client = getSupabaseServerClient();

  if (!client) {
    return null;
  }

  const todayKey = normalizeDateKey(new Date());
  const todayResult = await client
    .from("daily_topic_cache")
    .select("*")
    .eq("topic_date", todayKey)
    .limit(1);

  if (!todayResult.error) {
    const todayRows = safeRows(todayResult.data);

    if (todayRows.length > 0) {
      return todayRows[0];
    }
  }

  const fallbackResult = await client
    .from("daily_topic_cache")
    .select("*")
    .order("topic_date", { ascending: false })
    .limit(1);

  if (fallbackResult.error) {
    console.error("Supabase daily_topic_cache error:", fallbackResult.error.message);
    return null;
  }

  const rows = safeRows(fallbackResult.data);
  return rows[0] ?? null;
}

async function fetchUserTopicHistory(userId: string): Promise<UnknownRow[]> {
  const client = getSupabaseServerClient();

  if (!client) {
    return [];
  }

  const byUser = await client
    .from("user_topic_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_RECORDS);

  if (!byUser.error) {
    return safeRows(byUser.data);
  }

  const withoutUserFilter = await client
    .from("user_topic_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_RECORDS);

  if (withoutUserFilter.error) {
    console.error(
      "Supabase user_topic_history error:",
      withoutUserFilter.error.message,
    );
    return [];
  }

  return safeRows(withoutUserFilter.data);
}

async function fetchLeaderboardRows(): Promise<UnknownRow[]> {
  const client = getSupabaseServerClient();

  if (!client) {
    return [];
  }

  const result = await client
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(20);

  if (result.error) {
    console.error("Supabase leaderboard error:", result.error.message);
    return [];
  }

  return safeRows(result.data);
}

class InMemorySpeakeasyRepository implements SpeakeasyRepository {
  async getLandingSnapshot(): Promise<RepositorySnapshot> {
    return cloneData(snapshot);
  }

  async getConversationSnapshot(): Promise<RepositorySnapshot> {
    return cloneData(snapshot);
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    return cloneData(dashboardSnapshot);
  }
}

class SupabaseSpeakeasyRepository implements SpeakeasyRepository {
  async getLandingSnapshot(): Promise<RepositorySnapshot> {
    return this.buildRepositorySnapshot(DEFAULT_USER_ID);
  }

  async getConversationSnapshot(): Promise<RepositorySnapshot> {
    return this.buildRepositorySnapshot(DEFAULT_USER_ID);
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const runtime = getSupabaseRuntimeConfig();

    if (!runtime.isConfigured) {
      return cloneData(dashboardSnapshot);
    }

    try {
      const [historyRows, leaderboardRawRows] = await Promise.all([
        fetchUserTopicHistory(DEFAULT_USER_ID),
        fetchLeaderboardRows(),
      ]);
      const leaderboardRows = mapLeaderboard(leaderboardRawRows, DEFAULT_USER_ID);
      const mappedHistory = mapTopicHistory(historyRows);

      return {
        progress: buildProgressFromRows(historyRows, leaderboardRows),
        topicHistory: mappedHistory,
        leaderboard: leaderboardRows,
        vocabularyLog: buildVocabularyFromRows(historyRows),
      };
    } catch (error) {
      console.error("Supabase dashboard fallback:", error);
      return cloneData(dashboardSnapshot);
    }
  }

  private async buildRepositorySnapshot(
    userId: string,
  ): Promise<RepositorySnapshot> {
    const runtime = getSupabaseRuntimeConfig();

    if (!runtime.isConfigured) {
      return cloneData(snapshot);
    }

    try {
      const [topicRow, historyRows, leaderboardRawRows] = await Promise.all([
        fetchTopicFromCache(),
        fetchUserTopicHistory(userId),
        fetchLeaderboardRows(),
      ]);

      const activeTopic = mapDailyTopic(topicRow);
      const leaderboardRows = mapLeaderboard(leaderboardRawRows, userId);
      const mappedHistory = mapTopicHistory(historyRows);
      const messagesFromTopic = buildMessagesFromTopic(activeTopic);

      return {
        topic: activeTopic,
        messages: messagesFromTopic,
        correction,
        workflow,
        topicHistory: mappedHistory,
        leaderboard: leaderboardRows,
        progress: buildProgressFromRows(historyRows, leaderboardRows),
      };
    } catch (error) {
      console.error("Supabase snapshot fallback:", error);
      return cloneData(snapshot);
    }
  }
}

function createRepository(): SpeakeasyRepository {
  const runtime = getSupabaseRuntimeConfig();

  if (!runtime.isConfigured) {
    return new InMemorySpeakeasyRepository();
  }

  return new SupabaseSpeakeasyRepository();
}

export const speakeasyRepository: SpeakeasyRepository = createRepository();
