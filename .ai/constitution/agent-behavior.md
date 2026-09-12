# Agent Behavior

This document defines the shared behavior contract for coding agents working in this repository.

## Before work

- Load persistent context in the order defined in `docs/architecture/agent-context-model.md`.
- Inspect the current request, `docs/status/current-state.md`, and relevant files.
- Find evidence in existing documentation and implementation, then determine the affected scope.
- For change work, prepare a proportionate plan and verification strategy before implementation.

## During work

- Stay within the user request and accepted decisions.
- Treat existing changes as user-owned and do not overwrite unrelated work.
- Surface material assumptions and architectural changes (e.g. introducing a real backend for the RelayHub Lab, adding a CMS, changing the deployment target).
- Never implement arbitrary URL, header, script, or credential input in the public Live Lab, even if a task seems to imply it — flag it instead (see `.ai/constitution/engineering-principles.md`, "Demo safety is non-negotiable").
- Record a new rule once, in the correct source of truth — not duplicated across `.ai/constitution/`, `docs/`, and the agent adapters.

## Before completion

- Run relevant verification (lint, typecheck, build, test) or state why it could not be run.
- Review the final change against the requirement, `docs/architecture/`, and documentation responsibilities.
- Distinguish completed work, remaining risks, and open decisions.
- Update `docs/status/current-state.md` when the next session needs to know about a state change.

Claiming completion and demonstrating verification are different. Do not claim success without verification evidence.
