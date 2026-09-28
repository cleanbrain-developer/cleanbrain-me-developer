import type { HTMLAttributes } from "react";

type CardTone = "default" | "danger" | "live";

const TONE_BORDER: Record<CardTone, string> = {
  default: "border-border",
  danger: "border-destructive/40",
  live: "border-live/40",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  elevated?: boolean;
  /** Tighter padding for dense grids (e.g. a 3-up stat strip on mobile) instead of the default p-5. */
  compact?: boolean;
}

/**
 * A minimal shadcn-style primitive: local component, not an installed
 * package. Generalizes the stat-tile box pattern that was hand-written three
 * separate times (`StatTile` in live-dashboard.tsx, the inline tiles in
 * impact-stats.tsx, and plain `rounded-lg border ... bg-surface p-5` boxes
 * scattered across the portfolio pages). `compact` is a real prop (not a
 * className override) since two conflicting Tailwind padding utilities in
 * one class string don't reliably resolve by call-site order.
 */
export function Card({ tone = "default", elevated = false, compact = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border ${TONE_BORDER[tone]} ${elevated ? "bg-surface-elevated" : "bg-surface"} ${compact ? "p-3" : "p-5"} ${className}`.trim()}
      {...props}
    />
  );
}

export function CardLabel({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-xs uppercase tracking-wide text-muted ${className}`.trim()} {...props} />;
}

export function CardValue({
  compact = false,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { compact?: boolean }) {
  return (
    <p
      className={`mt-2 font-mono font-semibold text-foreground ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"} ${className}`.trim()}
      {...props}
    />
  );
}
