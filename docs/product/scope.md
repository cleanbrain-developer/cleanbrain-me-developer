# Scope

## V1 in scope (P0)

- App shell, navigation, layout, dark-first theme, common components.
- `/` redirects to `/lab/relayhub` (client-side, per ADR-0003's static-export constraints) — the RelayHub Live Monitoring dashboard is the front door, not the portfolio narrative. The former homepage content (hero, engineering focus, featured projects, live monitoring teaser, selected case studies, architecture/platform snapshot, resume/contact) lives at `/profile` instead, reachable from the header logo.
- `/projects` and `/projects/relayhub`, `/projects/english-core-speaking` (route and content schema; content can start thin, but no fabricated results).
- `/lab/relayhub`: `LiveDashboard` — real, live production telemetry read directly from `relayhub-java` (delivery summary, DLQ count, targets, ingress-rate and delivery-outcome sparklines), refreshed automatically every 10 seconds (see ADR-0004). There is no synthetic/mock simulation on this site anymore — see ADR-0005 for why the original interactive Mock Lab (Event Generator, Live Pipeline, mock Metrics, Recent Events, Event Detail, DLQ Replay) was removed.
- At least one real `/case-studies/[slug]` entry, company/customer information abstracted away.
- Responsive layout (desktop, tablet, mobile) and keyboard/accessibility support for all of the above.
- Static export (`output: "export"`) served by `nginx:alpine` — no Node server in production (see ADR-0003).

## V1 out of scope

- Any Kubernetes, K3s, DNS, TLS/certificate, Gateway, Cloudflare, or CI/CD *infrastructure* change — this repository owns application source, Dockerfile, and CI workflow only. Anything that looks like an infra requirement is recorded in `docs/infra-required-changes.md`, never implemented here directly.
- Any synthetic/mock simulation UI (an "Event Generator," a fabricated pipeline visualization, etc.) — removed entirely by ADR-0005. If a demo/simulation need re-emerges, it needs its own new decision, not a revival of the deleted code.
- A CMS, a global state-management library, authentication, or a database.
- Any write/mutating call from this site to `relayhub-java` — the live integration (ADR-0004) is strictly read-only (`GET` only, CORS-scoped to a handful of already-public endpoints). Arbitrary URL input, arbitrary header input, arbitrary script/code execution, or secret/credential input anywhere on this site remains out of scope regardless of whether a mock Lab exists to house it.
- Real company names, real customer data, real order/ticket IDs, real internal system IDs, or any production credential, anywhere in content or code.
- `/experience`, `/architecture`, `/resume`, `/contact`, and full English Core Speaking content are P1 — routable and content-schema-ready in V1, but not required to be feature-complete.

## Scope rule

Consider out-of-scope items only enough to avoid blocking future extension. Do not add placeholder screens, unused config options, or speculative abstractions ahead of a real requirement — this is exactly the reasoning ADR-0005 applied when it removed the unused `RelayHubAdapter`/`HttpRelayHubAdapter` machinery rather than leaving it in place "just in case."

## Open decisions

- Exact routing depth under `/case-studies` and `/projects` beyond the P0 set (init prompt §5 allows a more concise URL structure as long as the Profile / Projects / Engineering Lab / Case Studies / Architecture information structure is preserved — "Engineering Lab" is now the real Live Monitoring dashboard, not a simulation).
- Whether any other relayhub-java endpoints/metrics are worth surfacing on the dashboard later, and whether the CORS allowlist (ADR-0004) should grow to cover them — each addition should be deliberate, not a blanket `**` grant.
- Whether `cleanbrain-me-entrance`'s `Service.status` for this project should be `planned` during development or only added once this site is actually live (mirrors `cleanbrain-me-entrance`'s own open decision on showing pre-launch entries) — moot now since this site is already live with that entry added.
