/**
 * A small, purely decorative "this is alive" animation for a service card —
 * not data-driven, and deliberately not a reuse of LiveTopology's
 * pulse/explosion engine (same regression-avoidance reasoning ADR-0006
 * already applied to LiveSignal's homepage preview). It doesn't need to be
 * legible at a glance, just convey motion; Tailwind's animate-ping/
 * animate-pulse are already neutralized by globals.css's
 * prefers-reduced-motion rule, so no new CSS is needed here.
 */
export function LivePulse() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60 [animation-delay:150ms]" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-accent/40 [animation-delay:300ms]" />
    </div>
  );
}
