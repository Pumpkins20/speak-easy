import type { WorkflowStep } from "@/types/domain";

interface HowStepCardProps {
  step: WorkflowStep;
}

export default function HowStepCard({ step }: HowStepCardProps) {
  return (
    <div className="how-item">
      <span className="how-num">{step.number}</span>
      <div className="how-icon-pill">{step.pill}</div>
      <div className="how-title">{step.title}</div>
      <div className="how-desc">{step.description}</div>
    </div>
  );
}
