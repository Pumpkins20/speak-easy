import type { DailyTopicHistoryItem } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopicSelectorProps {
  topics: DailyTopicHistoryItem[];
  activeTopicTitle: string;
  onSelect: (title: string) => void;
}

export default function TopicSelector({
  topics,
  activeTopicTitle,
  onSelect,
}: TopicSelectorProps) {
  return (
    <div className="topic-mini">
      {topics.map((topic) => {
        const isActive = topic.title === activeTopicTitle;

        return (
          <Button
            key={topic.title}
            type="button"
            variant="unstyled"
            size="unstyled"
            className={`topic-chip topic-chip-button${isActive ? " active" : ""}`}
            onClick={() => onSelect(topic.title)}
          >
            <span>{topic.title}</span>
            <Badge variant="unstyled" className="topic-chip-tag">
              {topic.label}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
