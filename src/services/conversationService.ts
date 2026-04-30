import { speakeasyRepository } from "@/repositories/speakeasyRepository";
import { detectEstimatedLevel } from "@/services/levelDetectionService";
import type {
  ConversationMessage,
  ConversationScreenModel,
  DashboardViewModel,
  LandingViewModel,
  ProgressSummary,
} from "@/types/domain";

function estimateProgressLevel(
  progress: ProgressSummary,
  messages: ConversationMessage[],
): ProgressSummary {
  const userMessages = messages.filter((message) => message.role === "user");

  if (userMessages.length === 0) {
    return progress;
  }

  const totalWords = userMessages.reduce(
    (sum, item) => sum + item.text.trim().split(/\s+/).length,
    0,
  );

  const averageWordsPerSentence =
    userMessages.length === 0 ? 0 : totalWords / userMessages.length;

  const estimatedLevel = detectEstimatedLevel({
    totalSessions: progress.totalSessions,
    grammarErrorRate: 0.22,
    averageWordsPerSentence,
  });

  return {
    ...progress,
    estimatedLevel,
  };
}

export async function buildLandingViewModel(): Promise<LandingViewModel> {
  const snapshot = await speakeasyRepository.getLandingSnapshot();

  return {
    heroTopic: snapshot.topic,
    heroMessages: snapshot.messages,
    heroCorrection: snapshot.correction,
    workflow: snapshot.workflow,
    topicHistory: snapshot.topicHistory,
    leaderboard: snapshot.leaderboard,
    progress: estimateProgressLevel(snapshot.progress, snapshot.messages),
  };
}

export async function buildConversationScreenModel(): Promise<ConversationScreenModel> {
  const snapshot = await speakeasyRepository.getConversationSnapshot();

  return {
    mode: "guided",
    activeTopic: snapshot.topic,
    topicRecommendations: snapshot.topicHistory,
    messages: snapshot.messages,
    correction: snapshot.correction,
    leaderboard: snapshot.leaderboard,
    progress: estimateProgressLevel(snapshot.progress, snapshot.messages),
  };
}

export async function buildDashboardViewModel(): Promise<DashboardViewModel> {
  const snapshot = await speakeasyRepository.getDashboardSnapshot();

  return {
    progress: snapshot.progress,
    topicHistory: snapshot.topicHistory,
    leaderboard: snapshot.leaderboard,
    vocabularyLog: snapshot.vocabularyLog,
  };
}
