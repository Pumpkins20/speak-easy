export type ConversationMode = "guided" | "free";
export type ConversationRole = "assistant" | "user";
export type EstimatedLevel = "beginner" | "elementary" | "pre-intermediate";
export type StreakCellState = "active" | "partial" | "idle";

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  speaker: string;
  text: string;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface DailyTopic {
  id: string;
  title: string;
  category: string;
  starterQuestions: string[];
}

export interface DailyTopicHistoryItem {
  title: string;
  label: string;
  isToday?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  initials: string;
  displayName: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface ProgressSummary {
  currentStreak: number;
  weeklyScore: number;
  totalSessions: number;
  totalStudyMinutes: number;
  estimatedLevel: EstimatedLevel;
  streakCalendar: StreakCellState[][];
}

export interface VocabularyLogEntry {
  word: string;
  meaning: string;
  example?: string;
  sourceTopic?: string;
  lastSeenAt: string;
}

export interface WorkflowStep {
  number: string;
  pill: string;
  title: string;
  description: string;
}

export interface LandingViewModel {
  heroTopic: DailyTopic;
  heroMessages: ConversationMessage[];
  heroCorrection: GrammarCorrection;
  workflow: WorkflowStep[];
  topicHistory: DailyTopicHistoryItem[];
  leaderboard: LeaderboardEntry[];
  progress: ProgressSummary;
}

export interface ConversationScreenModel {
  mode: ConversationMode;
  activeTopic: DailyTopic;
  topicRecommendations: DailyTopicHistoryItem[];
  messages: ConversationMessage[];
  correction: GrammarCorrection | null;
  leaderboard: LeaderboardEntry[];
  progress: ProgressSummary;
}

export interface DashboardViewModel {
  progress: ProgressSummary;
  topicHistory: DailyTopicHistoryItem[];
  leaderboard: LeaderboardEntry[];
  vocabularyLog: VocabularyLogEntry[];
}

export interface ConversationHistoryMessagePayload {
  role: ConversationRole;
  text: string;
}

export interface RealtimeConversationRequestPayload {
  mode: ConversationMode;
  topicTitle: string;
  userText: string;
  history: ConversationHistoryMessagePayload[];
}

export interface RealtimeConversationResponsePayload {
  assistantMessage: string;
  correction: GrammarCorrection | null;
  source: "groq" | "fallback";
}

export interface LevelDetectionInput {
  totalSessions: number;
  grammarErrorRate: number;
  averageWordsPerSentence: number;
}

export interface GroqRuntimeConfig {
  apiKey?: string;
  baseUrl: string;
  conversationModel: string;
  grammarModel: string;
}

export interface SupabaseRuntimeConfig {
  url?: string;
  anonKey?: string;
  isConfigured: boolean;
}
