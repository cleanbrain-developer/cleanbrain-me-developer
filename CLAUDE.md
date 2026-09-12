# Claude Code Project Adapter

This file is the repository entry adapter for Claude Code. It is not the source of truth for shared policy or project design; it routes Claude Code to the repository context below.

## Required context

Read `PROJECT.yaml` first, then follow the bootstrap order and conflict-handling rules defined in `docs/architecture/agent-context-model.md`. This adapter does not restate that order — if this list and that document ever disagree, `agent-context-model.md` wins.

## Working contract

- Inspect existing evidence and prepare a change plan.
- Implement the smallest coherent change, verify it, and review the final diff.
- Do not leave architectural decisions or durable state only in conversation history.
- Add shared rules to the appropriate constitution or documentation source, not to this adapter.
- Make unresolved conflicts and open decisions explicit instead of silently fixing them through assumptions.
- Never implement arbitrary URL, header, script, or credential input in the public RelayHub Live Lab — see `.ai/constitution/engineering-principles.md`, "Demo safety is non-negotiable".
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure changes belong to `cleanbrain-me-infra`, not this repository — record requirements in `docs/infra-required-changes.md` instead of implementing them here.

Use `docs/status/current-state.md` as the source of truth for the current phase and next work.

Also see `AGENTS.md` below the Next.js-managed block for the Codex-compatible adapter; both adapters lead to the same shared sources of truth above.
