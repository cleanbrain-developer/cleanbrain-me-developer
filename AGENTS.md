<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

This file is the single, agent-agnostic entry point for any coding agent working in this repository — Claude Code, Codex, or any other tool that reads `AGENTS.md` (below the Next.js-managed block above, which `next dev` may rewrite — do not remove that block, only add below it). It is not the source of truth for product, architecture, or principles; it routes to them and states the behavioral contract every agent follows here. It is the sole adapter for this repository — there is no separate `CLAUDE.md` (`agent-dev-starter`'s `ADR-0011`; Claude Code has read `AGENTS.md` natively since v2.1.277, 2026-09-18).

## Context bootstrap

Read `PROJECT.yaml` first, then follow the bootstrap order and conflict-handling rules defined in `docs/architecture/agent-context-model.md`. This section does not restate that order — if this section and that document ever disagree, `agent-context-model.md` wins.

## Working contract

### Before work

- Load persistent context in the order `agent-context-model.md` defines.
- Inspect the current request, `docs/status/current-state.md`, and relevant files.
- Find evidence in existing documentation and implementation before proposing a change.
- For change work, prepare a proportionate plan and verification strategy before implementation.

### During work

- Stay within the user request and accepted decisions; treat existing changes as user-owned and do not overwrite unrelated work.
- Surface material assumptions and architectural changes (e.g. introducing a real backend for the RelayHub Lab, adding a CMS, changing the deployment target) instead of deciding them silently.
- Never implement arbitrary URL, header, script, or credential input in the public RelayHub Live Monitoring integration, even if a task seems to imply it — flag it instead (see `.specify/memory/constitution.md`, "The RelayHub Live Monitoring integration stays real, read-only, and narrowly scoped").
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure changes belong to `cleanbrain-me-infra`, not this repository — record requirements in `docs/infra-required-changes.md` instead of implementing them here.
- Record a new rule once, in its correct source of truth — never in this file.

### Before completion

- Run relevant verification (lint, typecheck, build, test) or state why it could not be run; distinguish a green automated check from direct verification against the real running system.
- Review the final change against the requirement, `docs/architecture/`, and documentation responsibilities.
- Distinguish completed work, remaining risks, and open decisions.
- Update `docs/status/current-state.md` when the next session needs to know about a state change.
- If this change edited a document with a `.ko.md` companion, update the companion in the same change — a stale translation is a defect, not a follow-up task.

Claiming completion and demonstrating verification are different. Do not claim success without verification evidence.

## Conflict handling

- A user request defines the work objective but does not silently discard accepted architecture (e.g. it does not justify implementing a real network call in the public Live Monitoring integration or adding arbitrary URL input).
- A specific accepted ADR takes precedence over a general architecture description.
- `current-state.md` does not redefine principles or design.
- Report unresolved conflicts instead of hiding them behind assumptions.

Use `docs/status/current-state.md` as the source of truth for the current phase and next work.
