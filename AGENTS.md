<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Codex Project Adapter

This file is the repository entry point for Codex-compatible agents (below the Next.js-managed block above, which `next dev` may rewrite — do not remove the block, only add below it). Do not duplicate project policy or design here. The shared sources of truth are listed below.

## Context bootstrap

Read `PROJECT.yaml` first, then follow the bootstrap order and conflict-handling rules defined in `docs/architecture/agent-context-model.md`. This adapter does not restate that order — if this list and that document ever disagree, `agent-context-model.md` wins.

## Working contract

- Inspect repository evidence before planning or changing anything.
- Prefer the smallest coherent change that satisfies the request.
- Never change architecture silently. Record significant decisions in an ADR.
- Never implement arbitrary URL, header, script, or credential input in the public RelayHub Live Lab.
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure changes belong to `cleanbrain-me-infra`, not this repository — record requirements in `docs/infra-required-changes.md` instead.
- Perform available verification before claiming completion, and distinguish verified results from unverified items.
- Persist durable decisions and working-state changes in the correct source of truth within the same change.
- Do not treat conversation history or this adapter as a long-term design source.

Always use `docs/status/current-state.md` as the source of truth for the current phase and next work.
