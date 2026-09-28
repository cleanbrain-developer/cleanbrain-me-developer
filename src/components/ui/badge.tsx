import type { HTMLAttributes } from "react";

type BadgeTone = "default" | "live" | "danger" | "success";

const TONE_CLASS: Record<BadgeTone, string> = {
  default: "border-border text-muted",
  live: "border-live/40 bg-live/10 text-live",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  success: "border-success/40 bg-success/10 text-success",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** A minimal shadcn-style primitive: local component, not an installed package. */
export function Badge({ tone = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs ${TONE_CLASS[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
