# Agent Context Model

## Context classes

### Permanent context

Information that persists across sessions, including project purpose, scope, architecture, engineering principles, and accepted decisions. Store it in `PROJECT.yaml`, `.ai/constitution/`, product and architecture documents, and ADRs.

### Working context

Information that changes with progress, including the current phase, recently completed work, next actions, and open decisions. Store it in `docs/status/current-state.md`.

If this project later grows per-feature design documents (e.g. a `specs/<feature>/` convention for the RelayHub Lab or a future real backend integration), each one's own status marker is working context too: it must be updated the moment the feature it describes changes state (implemented, deployed, superseded), on the same discipline as `current-state.md`. A design document that still says "not yet implemented" after the feature has shipped is a stale working-context source, not a historical record.

### Task context

The current user request, relevant code, and temporary research findings. Load it only when needed. If it gains durable value, persist it in the appropriate permanent or working source.

## Bootstrap order

1. Start from the relevant agent adapter (`CLAUDE.md` or `AGENTS.md`).
2. Read `PROJECT.yaml` to identify the project and phase.
3. Read the constitution (`.ai/constitution/`) to understand behavioral boundaries.
4. Read product documents (`docs/product/`) to understand purpose and scope.
5. Read architecture documents (`docs/architecture/`) to understand structure and responsibilities.
6. Read accepted ADRs (`docs/decisions/`) relevant to the current work.
7. Read `docs/status/current-state.md` to recover the current position and next work.
8. Inspect repository evidence relevant to the request (source tree, `docs/infra-required-changes.md` if the request touches deployment).
9. Plan, change, verify, and review.
10. Persist durable decisions and working-state changes in the repository.

## Conflict handling

- A user request defines the work objective but does not silently discard accepted architecture (e.g. it does not justify implementing a real network call in the public Lab or adding arbitrary URL input).
- A specific accepted ADR takes precedence over a general architecture description.
- Current state does not redefine principles or design.
- Differences between adapters do not change the shared source of truth.
- Report unresolved conflicts instead of hiding them behind assumptions.

## Bootstrap acceptance test

In a clean session, provide only the entry adapter and no external link. Context recovery succeeds when the agent answers the five acceptance questions in `docs/product/goals.md` ("Success criteria"), with every answer traceable to repository documentation.
