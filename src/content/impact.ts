import type { ImpactStat } from "@/content/types";

/**
 * Quantified outcomes, not narrative — the numbers behind the focus areas in
 * `experience.ts`. Company, customer, and system names are still never used
 * (same rule as Case Studies); these are the numbers already made public on
 * this engineer's own resume, kept as vague as the source (e.g. "₩Millions",
 * not an exact figure).
 */
export const impactStats: ImpactStat[] = [
  {
    value: "8+",
    label: "Years",
    detail: "Backend engineering, system integration, and production operations.",
  },
  {
    value: "19",
    label: "Projects delivered",
    detail: "Production delivery across identity, AI, enterprise, and cloud systems.",
  },
  {
    value: "200K–300K",
    label: "Users",
    detail: "Peak authentication traffic supported by a Redis-based SSO architecture.",
  },
  {
    value: "20+ → ~1",
    label: "Consistency incidents / week → / month",
    detail: "Cross-system transaction-consistency incidents reduced via preventive controls.",
  },
  {
    value: "<5s",
    label: "AI pipeline latency",
    detail: "Typical end-to-end STT → translation → TTS time for 3–4 spoken sentences.",
  },
  {
    value: "10",
    label: "Concurrent recipients",
    detail: "Validated real-time voice delivery capacity per WebSocket channel.",
  },
];
