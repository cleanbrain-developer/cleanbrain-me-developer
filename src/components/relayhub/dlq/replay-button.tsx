export function ReplayButton({
  disabled,
  isReplaying,
  onReplay,
}: {
  disabled?: boolean;
  isReplaying: boolean;
  onReplay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onReplay}
      disabled={disabled || isReplaying}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isReplaying ? "Replaying…" : "Replay from DLQ"}
    </button>
  );
}
