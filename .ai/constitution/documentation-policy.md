# Documentation Policy

## Authority

> Conversation is temporary. The repository is authoritative.

Conversations and external design documents (including the original init prompt and design spec that shaped this project) are bootstrap input only. A durable agreement is not complete until it has been persisted in the repository.

## Single responsibility

- Project identity and structured phase: `PROJECT.yaml`
- Product purpose, goals, and scope: `docs/product/`
- Structure and context model: `docs/architecture/`
- Significant decisions and rationale: `docs/decisions/`
- Current progress, next work, and open decisions: `docs/status/current-state.md`
- Durable engineering principles: `.specify/memory/constitution.md` (GitHub Spec Kit's own constitution role)
- Document ownership and the `.ko.md` language policy: this document, `.ai/constitution/documentation-policy.md`
- Agent bootstrap adapter: `AGENTS.md` (the sole adapter for every supported agent)

Do not duplicate the same policy across files. When a summary is useful, link to the authoritative path.

## Decision records

Record choices with long-term impact — such as introducing a real RelayHub backend integration, the deployment target, or the content/adapter architecture — in an ADR under `docs/decisions/`. An ADR must include context, decision, consequences, and status. An accepted ADR remains effective until another ADR supersedes it.

## Status hygiene

`current-state.md` is not a meeting log or a complete changelog. Keep only the completed work, work in progress, next actions, and open decisions required to reconstruct the current phase. Update it on every shipped, verified change, not only at a session boundary.

## Maintenance

If a code or structure change makes documentation false, update the documentation in the same change. Remove stale guidance; use ADRs or version control when history must be preserved.
