import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface ConversationSidebarCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ConversationSidebarCard({
  title,
  children,
  className,
}: ConversationSidebarCardProps) {
  const cardClassName = ["conversation-card", className].filter(Boolean).join(" ");

  return (
    <Card className={cardClassName}>
      <div className="conversation-card-title">{title}</div>
      {children}
    </Card>
  );
}
