import type { EstimatedLevel, LevelDetectionInput } from "@/types/domain";

export function detectEstimatedLevel(input: LevelDetectionInput): EstimatedLevel {
  const accuracyScore = Math.max(0, (1 - input.grammarErrorRate) * 10);
  const consistencyScore = Math.min(input.totalSessions, 20) * 0.8;
  const fluencyScore = Math.min(input.averageWordsPerSentence, 20) * 0.9;

  const totalScore = accuracyScore + consistencyScore + fluencyScore;

  if (totalScore >= 28) {
    return "pre-intermediate";
  }

  if (totalScore >= 20) {
    return "elementary";
  }

  return "beginner";
}
