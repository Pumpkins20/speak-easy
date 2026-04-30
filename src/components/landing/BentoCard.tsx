import type { CSSProperties, ReactNode } from "react";

interface BentoCardProps {
  className?: string;
  icon: string;
  iconStyle: CSSProperties;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function BentoCard({
  className,
  icon,
  iconStyle,
  title,
  description,
  children,
}: BentoCardProps) {
  const cardClassName = ["bento-item", className].filter(Boolean).join(" ");

  return (
    <div className={cardClassName}>
      <div className="bento-icon" style={iconStyle}>
        {icon}
      </div>
      <div className="bento-title">{title}</div>
      <div className="bento-desc">{description}</div>
      {children}
    </div>
  );
}
