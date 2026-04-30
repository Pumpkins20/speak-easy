interface MicButtonProps {
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function MicButton({
  isActive,
  disabled = false,
  onClick,
}: MicButtonProps) {
  return (
    <button
      type="button"
      className={`mic-btn${isActive ? " mic-btn-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={isActive ? "Hentikan rekaman" : "Mulai rekaman"}
      title={isActive ? "Sedang merekam" : "Mulai merekam"}
    >
      <svg className="mic-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 7a1 1 0 0 1 1 1 8 8 0 0 1-7 7.93V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A8 8 0 0 1 4 11a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}
