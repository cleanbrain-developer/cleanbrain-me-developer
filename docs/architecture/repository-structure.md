# Repository Structure

## Responsibility map

| Path | Owner responsibility | Must not become |
|---|---|---|
| `README.md` | Human introduction, dev/build commands, navigation to canonical docs | Full design specification |
| `PROJECT.yaml` | Structured project identity and phase | Narrative architecture document |
| `AGENTS.md` | The sole bootstrap adapter and behavioral contract for every supported agent (appended below Next.js's auto-managed block; `agent-dev-starter`'s `ADR-0011`) | Common policy source, or one of several duplicate adapters |
| `.specify/memory/constitution.md` | Durable engineering principles (GitHub Spec Kit's own constitution role — `agent-dev-starter`'s `ADR-0013`) | Product feature requirements |
| `.ai/constitution/documentation-policy.md` | Document ownership and the `.ko.md` language policy — no open standard owns this | Product feature requirements or engineering principles (those live in `.specify/memory/constitution.md`) |
| `docs/product/` | Problem, users, goals, scope | Implementation instructions |
| `docs/architecture/` | Structure, boundaries, context model | Decision history |
| `docs/decisions/` | Significant decisions and rationale | Mutable current-state checklist |
| `docs/status/current-state.md` | Current phase, progress, next work | Permanent policy or changelog |
| `docs/infra-required-changes.md` | Infra requirements this app cannot implement itself | Actual Kubernetes/DNS/TLS changes |
| `src/content/` | Portfolio content (profile, experience, projects, case studies) | Presentation logic |
| `src/lib/relayhub/` | RelayHub Lab domain types and `RelayHubAdapter` implementations | Presentation components |
| `src/components/` | Presentation of content and Lab domain state | Content or adapter definitions |

## Dependency direction

Adapters and summaries may point inward to authoritative documents. Authoritative documents do not depend on adapter wording or external conversation history.

```text
README ──────────────┐
AGENTS.md ────────────┼──> PROJECT.yaml + .specify/memory/constitution.md + docs
current-state ────────┘                 │
                                         └──> accepted ADRs
```

`PROJECT.yaml` lists canonical locations for discovery but does not duplicate their narrative content.

## Directory policy

Add a directory only when a file has a real responsibility within it. `docs/guides/` is intentionally absent — this repository has no repeatable operational procedure that needs one yet, and it does not distribute the Starter itself.

## Evolution rule

Before adding a top-level area or responsibility layer, confirm that an existing location cannot represent it. A change to the deployment boundary with `cleanbrain-me-infra`, to the `RelayHubAdapter` contract, or to the content model requires an ADR under `docs/decisions/`.
