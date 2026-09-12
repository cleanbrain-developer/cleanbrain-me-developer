# Current State

Last updated: 2026-09-12

## Current phase

V1 Foundation — repository-first context (`PROJECT.yaml`, `.ai/constitution/`, `docs/product/`, `docs/architecture/`, `docs/decisions/ADR-0001`, `docs/infra-required-changes.md`, this file) is adopted, following `agent-dev-starter`'s "New project" mode. No application UI exists yet beyond the unmodified `create-next-app` scaffold.

## Completed

- Chose the repository name `cleanbrain-me-developer` and scaffolded a Next.js (App Router, TypeScript, Tailwind, ESLint, `src/` dir, `@/*` import alias) project with `create-next-app`.
- Adopted a repository-first context structure by following `agent-dev-starter`'s adoption guide in "New project" mode, mirroring `cleanbrain-me-entrance`'s and `relayhub-java`'s prior adoptions: `PROJECT.yaml`, `.ai/constitution/{engineering-principles,agent-behavior,documentation-policy}.md`, `docs/product/{overview,goals,scope}.md`, `docs/architecture/{overview,repository-structure,agent-context-model}.md`, `docs/decisions/ADR-0001-repository-first-context.md`, `docs/infra-required-changes.md`, `CLAUDE.md`, and this file.
- `AGENTS.md`: appended the Codex adapter content below Next.js's own auto-managed `<!-- BEGIN/END:nextjs-agent-rules -->` block instead of replacing it, since `next dev` re-writes that block.
- Recorded ADR-0001 (repository-first context) as accepted, with `cleanbrain.developer` as decider, and an explicit note that where implementation diverges from the original init prompt / design spec, the repository wins.
- Content, adapter-pattern, and demo-safety rules from the source design spec were converted into durable constitution/architecture rules rather than left as prose in this file (see `.ai/constitution/engineering-principles.md` and `docs/architecture/overview.md`).
- Ran the bootstrap acceptance test in a fresh, isolated agent session starting only from `CLAUDE.md` (2026-09-12): all five acceptance questions in `docs/product/goals.md` were answered correctly with repository-path citations, no fabricated content, and no contradictions found across `PROJECT.yaml`, the constitution, product/architecture docs, ADR-0001, and this file.

## In progress

- None currently. See Next.

## Next

1. Get the maintainer's explicit confirmation, then: `git add`+commit this foundation, create the `cleanbrain-developer/cleanbrain-me-developer` GitHub repository, and push — adoption itself does not imply consent to either (see `agent-dev-starter`'s `docs/guides/using-the-starter.md`, "Who performs the adoption").
2. Implement Phase 1 (Foundation) per the init prompt: App Shell, Navigation, Layout, Theme (dark-first), common components — then stop for maintainer review before Phase 2 (Portfolio Core), per the maintainer's stated step-by-step preference.
3. Once the first real implementation lands, revisit `PROJECT.yaml`'s `delivery.implementation_present` (currently `false`) and `project.lifecycle`/`current_phase` (currently `design`/`v1-foundation`) — this is expected, not a surprise, per the adoption guide's "New project" mode note.
4. Later phases (not yet started): Portfolio Core (Homepage, Experience, Projects, RelayHub project detail, Case Studies, Architecture, Resume, Contact) → RelayHub Lab Mock (`MockRelayHubAdapter` + Lab UI) → Real API Ready (`RelayHubAdapter`/`HttpRelayHubAdapter` interface only, no real backend call yet) → Quality (a11y, responsive, SEO, tests, performance).
5. After this site is live, add a real (non-`planned`) `developer` entry to `cleanbrain-me-entrance`'s `src/config/services.ts` (tracked in both repositories).

## Open decisions

See `docs/product/scope.md`, "Open decisions" (routing depth, `HttpRelayHubAdapter` timing, and `cleanbrain-me-entrance`'s `planned`-status question).

## Known constraints

- No backend, database, authentication, or CMS in V1 (see `docs/product/scope.md`).
- The public RelayHub Live Lab must never accept arbitrary URL, header, script, or credential input, and must only ever use synthetic data (see `.ai/constitution/engineering-principles.md`, "Demo safety is non-negotiable").
- Target cluster is 2 vCPU / 4 GB RAM / 40 GB disk (per `cleanbrain-me-infra`) — the combined resource budget across all services already approaches this ceiling (see that repository's README and `cleanbrain-me-entrance`'s own `current-state.md`), so this app must stay lightweight.
- This repository owns application source, Dockerfile, and CI; `cleanbrain-me-infra` owns the production Kubernetes manifest — the two must not duplicate each other's content. Anything that looks like a required infra change is recorded in `docs/infra-required-changes.md`, never implemented here.
- No Git commit, GitHub repository/remote creation, or push has happened yet for this project — see Next, item 2.

## Exit criteria for this phase

- A fresh agent session, given only `AGENTS.md` or `CLAUDE.md`, correctly answers the five acceptance questions in `docs/product/goals.md`, each traceable to a repository path. (Met — 2026-09-12.)
- The foundation is committed as a reviewable baseline, with the maintainer's explicit confirmation for repository/remote creation and the first push. (Not yet done.)
- Phase 1 (Foundation) application code exists and builds/lints cleanly. (Not yet done.)
