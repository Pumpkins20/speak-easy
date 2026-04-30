import TopicSelector from "@/components/conversation/TopicSelector";
import type { DailyTopicHistoryItem } from "@/types/domain";

import ConversationSidebarCard from "./ConversationSidebarCard";

interface ConversationTopicCardProps {
  topics: DailyTopicHistoryItem[];
  activeTopicTitle: string;
  onSelect: (title: string) => void;
}

export default function ConversationTopicCard({
  topics,
  activeTopicTitle,
  onSelect,
}: ConversationTopicCardProps) {
  return (
    <ConversationSidebarCard title="Topik Harian">
      <TopicSelector
        topics={topics}
        activeTopicTitle={activeTopicTitle}
        onSelect={onSelect}
      />
    </ConversationSidebarCard>
  );
}
