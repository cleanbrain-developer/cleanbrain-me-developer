> 이 문서는 [`repository-structure.md`](repository-structure.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Repository Structure

## 책임 지도 (Responsibility map)

| Path | Owner responsibility | Must not become |
|---|---|---|
| `README.md` | 사람을 위한 소개, dev/build 명령어, canonical 문서로의 navigation | 완전한 design specification |
| `PROJECT.yaml` | 구조화된 프로젝트 정체성과 phase | narrative architecture document |
| `AGENTS.md` | 모든 지원 agent를 위한 유일한 bootstrap adapter이자 behavioral contract(Next.js가 자동 관리하는 블록 아래에 추가됨; `agent-dev-starter`의 `ADR-0011`) | 공통 정책 source, 또는 여러 중복 adapter 중 하나 |
| `.specify/memory/constitution.md` | 지속적인 engineering 원칙(GitHub Spec Kit 자체의 constitution 역할 — `agent-dev-starter`의 `ADR-0013`) | product feature requirement |
| `.ai/constitution/documentation-policy.md` | 문서 소유권과 `.ko.md` 언어 정책 — 어떤 open standard도 이를 소유하지 않음 | product feature requirement나 engineering 원칙(이들은 `.specify/memory/constitution.md`에 있음) |
| `docs/product/` | 문제, 사용자, 목표, 범위 | 구현 지침 |
| `docs/architecture/` | 구조, 경계, context model | decision history |
| `docs/decisions/` | 중대한 결정과 근거 | mutable current-state checklist |
| `docs/status/current-state.md` | 현재 phase, 진행 상황, 다음 작업 | 영구적인 정책이나 changelog |
| `docs/infra-required-changes.md` | 이 앱이 스스로 구현할 수 없는 infra 요구사항 | 실제 Kubernetes/DNS/TLS 변경 |
| `src/content/` | 포트폴리오 콘텐츠(프로필, 경력, 프로젝트, 케이스 스터디) | presentation logic |
| `src/lib/relayhub/` | RelayHub Lab domain type과 `RelayHubAdapter` 구현 | presentation component |
| `src/components/` | 콘텐츠와 Lab domain 상태의 presentation | 콘텐츠나 adapter 정의 |

## 의존성 방향 (Dependency direction)

Adapter와 summary는 authoritative한 문서를 안쪽으로 가리킬 수 있습니다. authoritative한 문서는 adapter의 문구나 외부 conversation history에 의존하지 않습니다.

```text
README ──────────────┐
AGENTS.md ────────────┼──> PROJECT.yaml + .specify/memory/constitution.md + docs
current-state ────────┘                 │
                                         └──> accepted ADRs
```

`PROJECT.yaml`은 discovery를 위한 canonical location들을 나열할 뿐, 그 narrative 내용을 중복해서 담지 않습니다.

## Directory 정책

파일이 그 안에서 실제 책임을 가질 때만 디렉터리를 추가합니다. `docs/guides/`는 의도적으로 존재하지 않습니다 — 이 repository에는 아직 그것이 필요한 반복 가능한 운영 절차가 없고, Starter 자체를 배포하지도 않습니다.

## Evolution 규칙

top-level 영역이나 책임 계층을 추가하기 전에, 기존 위치가 이를 대변할 수 없는지 확인합니다. `cleanbrain-me-infra`와의 deployment 경계, `RelayHubAdapter` contract, content model에 대한 변경은 `docs/decisions/` 아래 ADR이 필요합니다.
