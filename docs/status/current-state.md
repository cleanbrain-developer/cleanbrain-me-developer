# Current State

Last updated: 2026-09-13

## Current phase

Phase 3 (RelayHub Lab Mock) — `/lab/relayhub` is a real, interactive mock of RelayHub's event pipeline (Event Generator, Live Pipeline, Metrics, Recent Events, Event Detail, DLQ/Replay), backed entirely by `MockRelayHubAdapter`. Phase 4 (`HttpRelayHubAdapter` interface readiness) has not started.

## Completed

- Chose the repository name `cleanbrain-me-developer` and scaffolded a Next.js (App Router, TypeScript, Tailwind, ESLint, `src/` dir, `@/*` import alias) project with `create-next-app`.
- Adopted a repository-first context structure by following `agent-dev-starter`'s adoption guide in "New project" mode, mirroring `cleanbrain-me-entrance`'s and `relayhub-java`'s prior adoptions: `PROJECT.yaml`, `.ai/constitution/{engineering-principles,agent-behavior,documentation-policy}.md`, `docs/product/{overview,goals,scope}.md`, `docs/architecture/{overview,repository-structure,agent-context-model}.md`, `docs/decisions/ADR-0001-repository-first-context.md`, `docs/infra-required-changes.md`, `CLAUDE.md`, and this file.
- `AGENTS.md`: appended the Codex adapter content below Next.js's own auto-managed `<!-- BEGIN/END:nextjs-agent-rules -->` block instead of replacing it, since `next dev` re-writes that block.
- Recorded ADR-0001 (repository-first context) as accepted, with `cleanbrain.developer` as decider, and an explicit note that where implementation diverges from the original init prompt / design spec, the repository wins.
- Content, adapter-pattern, and demo-safety rules from the source design spec were converted into durable constitution/architecture rules rather than left as prose in this file (see `.ai/constitution/engineering-principles.md` and `docs/architecture/overview.md`).
- Ran the bootstrap acceptance test in a fresh, isolated agent session starting only from `CLAUDE.md` (2026-09-12): all five acceptance questions in `docs/product/goals.md` were answered correctly with repository-path citations, no fabricated content, and no contradictions found across `PROJECT.yaml`, the constitution, product/architecture docs, ADR-0001, and this file.
- Committed the foundation and pushed to the new public GitHub repository `cleanbrain-developer/cleanbrain-me-developer` (`main` branch), with the maintainer's explicit confirmation.
- Implemented Phase 1 (Foundation): dark-first theme tokens in `src/app/globals.css` (no light-mode toggle — a deliberate simplification, not an oversight; see `docs/product/scope.md` if this needs revisiting), `SiteHeader`/`SiteFooter`/`Container` in `src/components/layout/`, a shared `PlaceholderSection` in `src/components/common/`, a skip-to-content link and `:focus-visible` styling in `src/app/layout.tsx`, `prefers-reduced-motion` support, and a routed stub page for every top-level nav item (`/`, `/experience`, `/projects`, `/lab` → redirects to `/lab/relayhub`, `/case-studies`, `/architecture`, `/resume`, `/contact`).
- Verified: `npm run lint` and `npm run build` both pass (all 9 routes prerender as static content). Ran the dev server and checked it with a headless-Chromium screenshot at desktop and mobile (390px) viewports — dark theme, nav, and the `/lab` → `/lab/relayhub` redirect all render and behave correctly; no console errors observed.
- Implemented Phase 2 (Portfolio Core) content and pages: `src/content/{types,profile,experience,projects}.ts` and `src/content/case-studies/{distributed-delivery-race-condition,approval-rollback-timeout,legacy-batch-state,index}.ts`; presentation components under `src/components/{portfolio,project,case-study}/`. Replaced the Phase 1 placeholder stubs on `/`, `/experience`, `/projects`, `/case-studies`, `/architecture`, `/resume`, `/contact` with real content, and added `/projects/[slug]` and `/case-studies/[slug]` dynamic detail routes (`generateStaticParams` over the two current projects and three case studies). `/lab` and `/lab/relayhub` are untouched — still Phase 1 placeholders, on purpose (Phase 3).
- Profile/experience/tech-stack content is sourced from the maintainer's own existing public `cleanbrain-developer/cleanbrain-developer` GitHub profile README, not invented; the Experience/Resume pages present it by focus area rather than a company-name/date timeline, per the maintainer's explicit choice (no fabricated employment history).
- The two Project entries (RelayHub, English Core Speaking) describe real, live projects, using the actual live hostnames from `cleanbrain-me-infra`'s manifests (`relayhub-java.developer.cleanbrain.me`, `english-core-speaking.cleanbrain.me`) and real technical facts already recorded elsewhere (Kafka/Prometheus/admin console for RelayHub; NestJS/Vue3/Prisma/OAuth for English Core Speaking) — no invented metrics or results.
- The three Case Studies are, per the maintainer's explicit choice, composite/abstracted scenarios built from the three topics the original design spec suggested (race condition, external-approval timeout, legacy-batch state) — qualitative only, no fabricated numbers, and each says so explicitly in its own summary.
- `/contact` and `/resume` display the maintainer's real GitHub (`github.com/cleanbrain-developer`) and email (`cleanbrain.developer@gmail.com`), per the maintainer's explicit confirmation to publish both.
- Verified: `npm run lint` and `npm run build` pass (17 routes, including 2 SSG project detail pages and 3 SSG case-study detail pages). Checked `/`, `/projects`, `/projects/relayhub`, `/case-studies`, `/case-studies/distributed-delivery-race-condition`, `/architecture`, `/resume`, `/contact`, and `/experience` in a real browser via headless-Chromium screenshots — all render correctly, no console errors observed.
- Implemented Phase 3 (RelayHub Lab Mock): domain types and the `RelayHubAdapter` interface in `src/lib/relayhub/{types,adapter,scenarios,pipeline}.ts`; `MockRelayHubAdapter` (`src/lib/relayhub/mock-adapter.ts`) as an in-memory, scenario-driven state machine covering all four predefined scenarios (normal; target-500 and timeout, both retrying 3 times before moving to DLQ; validation-error, which fails immediately with no retry); `relayHubLabService` (`src/lib/relayhub/service.ts`) as the single adapter-selection point components depend on, never a concrete adapter or `fetch()` directly.
- Built the Lab UI under `src/components/relayhub/{event-generator,pipeline,metrics,recent-events,event-detail,dlq}/`, composed by the client-side orchestrator `src/components/relayhub/relayhub-lab.tsx`, which now renders at `/lab/relayhub` in place of the Phase 1 `PlaceholderSection`. The Pipeline view collapses multi-attempt delivery retries into one slot (with an "N attempts" badge) for the top-level view, while the full per-attempt timeline and retry history remain visible in Event Detail. A newly generated event's pipeline is revealed stage-by-stage over ~1.8s using the adapter's own real per-event stage results (not a canned animation) — a previously-generated event selected from Recent Events is shown fully resolved, not re-animated.
- `replayDlq` models both outcomes named in the design spec (roughly 70% success / 30% still-DLQ on replay, not hardcoded to always succeed) by appending new delivery/target stage entries to the event's existing timeline rather than discarding retry history.
- Demo-safety constraints from `.ai/constitution/engineering-principles.md` hold structurally, not just by convention: `GenerateEventInput` only accepts the closed `EventType`/`Scenario` unions: there is no code path through which the UI could send an arbitrary URL, header, script, or credential to the adapter.
- Verified: `npm run lint` and `npm run build` pass. Drove the Lab in a real browser (headless Chromium via Playwright, since `chromium-cli` was unavailable in this environment) through all four scenarios plus a DLQ replay — Normal (all stages succeed), Target 500 (3 retries → DLQ, confirmed via screenshot), Replay from DLQ (observed the ~30% failure branch, handled correctly — event stayed `dlq` with a clear replay-failed message and undiminished retry history), and Validation Error (fails immediately, transformation/delivery/target correctly shown `skipped`, no retries). Also checked at a 390px mobile viewport (single-column stacking, no horizontal page scroll; only the Recent Events table scrolls internally, by design). No console errors in any run.

## In progress

- None currently. See Next.

## Next

1. Maintainer review of Phase 3 before Phase 4 starts (stated step-by-step preference) — pending.
2. Phase 4: `HttpRelayHubAdapter` interface readiness only (no real backend call yet) + env-based adapter selection in `src/lib/relayhub/service.ts`.
3. Phase 5: accessibility, responsive, and SEO hardening beyond Phase 1's baseline (e.g. per-page OpenGraph/canonical, JSON-LD); automated test suite (currently zero automated tests — all verification so far has been lint/build/manual browser checks, per `docs/product/scope.md`'s "Testing" expectations still being unmet).
4. After this site is live, add a real (non-`planned`) `developer` entry to `cleanbrain-me-entrance`'s `src/config/services.ts` (tracked in both repositories).

## Open decisions

See `docs/product/scope.md`, "Open decisions" (routing depth, `HttpRelayHubAdapter` timing, and `cleanbrain-me-entrance`'s `planned`-status question).

## Known constraints

- No backend, database, authentication, or CMS in V1 (see `docs/product/scope.md`).
- The public RelayHub Live Lab must never accept arbitrary URL, header, script, or credential input, and must only ever use synthetic data (see `.ai/constitution/engineering-principles.md`, "Demo safety is non-negotiable").
- Target cluster is 2 vCPU / 4 GB RAM / 40 GB disk (per `cleanbrain-me-infra`) — the combined resource budget across all services already approaches this ceiling (see that repository's README and `cleanbrain-me-entrance`'s own `current-state.md`), so this app must stay lightweight.
- This repository owns application source, Dockerfile, and CI; `cleanbrain-me-infra` owns the production Kubernetes manifest — the two must not duplicate each other's content. Anything that looks like a required infra change is recorded in `docs/infra-required-changes.md`, never implemented here.
- No real chronological work-history timeline (company names, role titles, dates) exists anywhere on the site, by the maintainer's explicit choice — Experience/Resume are focus-area narratives only. Revisit only if the maintainer explicitly asks for a timeline later.
- Case studies are intentionally composite/abstracted with no real metrics — do not "fill in" numbers later without the maintainer explicitly providing real, disclosable ones.

## Exit criteria for this phase

- A fresh agent session, given only `AGENTS.md` or `CLAUDE.md`, correctly answers the five acceptance questions in `docs/product/goals.md`, each traceable to a repository path. (Met — 2026-09-12.)
- The foundation is committed as a reviewable baseline, with the maintainer's explicit confirmation for repository/remote creation and the first push. (Met.)
- Phase 1 (Foundation) application code exists and builds/lints cleanly, verified in a real browser at desktop and mobile widths. (Met.)
- Phase 2 (Portfolio Core) real content exists for every P0 route (Homepage, Experience, Projects × 2, Case Studies × 3, Architecture, Resume, Contact), builds/lints cleanly, and was spot-checked in a real browser. (Met.)
- Phase 3 (RelayHub Lab Mock) is functional end to end — all four scenarios and DLQ replay work, backed by `MockRelayHubAdapter` behind the `RelayHubAdapter` interface, verified in a real browser including a mobile viewport. (Met.)
