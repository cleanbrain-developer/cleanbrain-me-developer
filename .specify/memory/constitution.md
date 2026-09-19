# Constitution

This is the project's constitution in the sense GitHub Spec Kit uses the term: durable principles every change in this repository is evaluated against. It replaces the old `.ai/constitution/engineering-principles.md` (see `docs/status/current-state.md`'s 2026-09-20 V2 migration entry, mirroring `agent-dev-starter`'s `ADR-0013`) — this is now the one place these principles live.

## Evidence before change

Inspect existing documentation and implementation first. Prefer repository evidence over assumptions, and do not propose changes based on a structure that has not been verified.

## Minimal, coherent change

Prefer the smallest coherent change that satisfies the requirement. This is a portfolio site with a live monitoring dashboard reading a real backend's public telemetry, not a production event-processing platform itself — do not add a real backend, database, or authentication layer of this site's own until a real requirement forces it (see `docs/product/scope.md`). ADR-0005's removal of the unused Mock RelayHub Lab is the concrete precedent this principle points to: confirmed-unused code gets deleted, not kept "just in case."

## Explicit architecture

Do not change architectural boundaries or conventions silently. Surface decisions that have long-term impact or are difficult to reverse — for example, expanding the `relayhub-java` CORS/API surface this site depends on (ADR-0004), reintroducing any form of mock/simulation UI (ADR-0005), adding a CMS, or adding a state-management library — and record them in an ADR before or with implementation.

## Verifiable outcomes

Produce outcomes that can be verified. Run lint, typecheck, and the test suite once they exist; otherwise state the verification method and its limitations. A green automated check is evidence about the code; direct verification against the running app (browser, real route) is evidence about reality — prefer the second whenever a UI or interaction claim is being made.

## Content over code

Portfolio content — profile, experience, project descriptions, case studies — lives under `src/content/`, never hardcoded inside presentation components. Adding or editing content must not require touching a component.

## The RelayHub Live Monitoring integration stays real, read-only, and narrowly scoped

There is no adapter/mock boundary to preserve anymore (ADR-0005 removed it) — `src/lib/relayhub/live-observability.ts` calls `relayhub-java` directly. What must be preserved instead: every call is `GET`-only against endpoints already covered by that service's CORS allowlist (ADR-0004); nothing on this site ever sends a request that could mutate `relayhub-java` state; and no arbitrary URL, header, script, or credential input from a visitor is ever implemented, even as a convenience or a "temporary" affordance (see `docs/product/scope.md`). Do not reintroduce a synthetic "generate an event" UI without a new ADR explicitly reopening that question.

## Separated boundaries

Keep domain concerns (content, the `relayhub-java` live-telemetry client) separate from external systems and tooling (build tool, container runtime, Kubernetes deployment). Deployment and infrastructure concerns belong to the `cleanbrain-me-infra` repository, not to this repository's source tree.

## Standards over reinvention

Prefer an established open standard or convention (`AGENTS.md`, GitHub Spec Kit, Agent Skills) over building an equivalent mechanism from scratch, per this repository's V2 migration onto `agent-dev-starter`'s own standards-aligned foundation (see `docs/status/current-state.md`). Before adding a project-specific process, decision format, or file convention, check whether an open standard already solves it.
