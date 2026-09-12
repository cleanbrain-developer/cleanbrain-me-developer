# ADR-0001: Repository-First Context

- Status: Accepted
- Date: 2026-09-12
- Deciders: cleanbrain.developer

## Context

This project was initiated from two external documents (an init prompt and a design spec) rather than incremental conversation, and will be developed across many sessions and possibly different coding agents (Claude Code, Codex-compatible agents). If project intent, architecture, and working state exist only in those source documents or in conversation history, they are lost or drift out of sync once implementation diverges from the original prompt, forcing every new session to be re-briefed from scratch or from a stale document.

## Decision

Use the repository as the authoritative source of persistent project context, following the `agent-dev-starter` (ADS) convention already adopted by `cleanbrain-me-entrance` and `relayhub-java`.

- Structure project identity in `PROJECT.yaml`.
- Store durable principles in `.ai/constitution/`.
- Store product and architecture explanations under `docs/`.
- Store significant decisions and rationale in ADRs under `docs/decisions/`.
- Store working state in `docs/status/current-state.md`.
- Keep `AGENTS.md` and `CLAUDE.md` as thin agent-specific adapters that load the shared core.
- Treat the original init prompt and design spec as bootstrap input only, not a long-term dependency, once their accepted decisions are persisted here — where implementation and this repository's documentation diverge from those original documents, the repository wins (see `.ai/constitution/documentation-policy.md`).

## Consequences

### Positive

- New sessions and different agents can continue work without the original init prompt or design spec.
- Shared policy has one source, reducing adapter drift between `AGENTS.md` and `CLAUDE.md`.
- Decisions, working state, and task prompts have separate lifetimes and responsibilities.

### Costs and risks

- Code and documentation must be maintained together, or the repository stops being trustworthy as context.
- An agent that ignores the bootstrap order may miss important context.
- Markdown rules cannot guarantee compliance; deterministic gates (tests, lint, CI) will be needed later for rules that must never be violated (e.g. never implementing arbitrary URL input in the Live Lab).

## Alternatives considered

### Keep the original init prompt as the working spec

Simple to start from, but the two source documents describe an ambitious full scope up front and would drift from actual implementation phase by phase, exactly the failure mode repository-first context exists to avoid. Rejected.

### Agent-specific documents as independent sources

Makes tool-specific optimization easy but creates policy duplication and drift between `AGENTS.md` and `CLAUDE.md`. Rejected.
