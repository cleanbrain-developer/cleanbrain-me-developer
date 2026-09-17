> 이 문서는 [`ADR-0001-repository-first-context.md`](ADR-0001-repository-first-context.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0001: Repository-First Context

- Status: Accepted
- Date: 2026-09-12
- Deciders: cleanbrain.developer

## Context

이 프로젝트는 점진적인 conversation이 아니라 두 개의 외부 문서(init prompt와 design spec)로부터 시작되었으며, 여러 세션과 어쩌면 서로 다른 coding agent(Claude Code, Codex-compatible agent)를 거쳐 개발될 것입니다. 프로젝트의 의도, architecture, working state가 그 source document나 conversation history에만 존재한다면, 구현이 원래 prompt에서 벗어나는 순간 그것들은 사라지거나 서로 어긋나게 되어, 매 새로운 세션이 처음부터 또는 낡은 문서로부터 다시 브리핑받아야 하는 상황을 만듭니다.

## Decision

`cleanbrain-me-entrance`와 `relayhub-java`가 이미 채택한 `agent-dev-starter`(ADS) convention을 따라, repository를 지속적인 프로젝트 context의 authoritative source로 사용합니다.

- `PROJECT.yaml`에 프로젝트 정체성을 구조화한다.
- `.ai/constitution/`에 durable한 원칙을 저장한다.
- `docs/` 아래에 product와 architecture 설명을 저장한다.
- `docs/decisions/` 아래 ADR에 중대한 결정과 근거를 저장한다.
- `docs/status/current-state.md`에 working state를 저장한다.
- `AGENTS.md`와 `CLAUDE.md`는 공유되는 core를 로드하는 얇은 agent별 adapter로 유지한다.
- 원래의 init prompt와 design spec은, 그 안의 accepted decision이 여기에 저장된 이후에는 bootstrap 입력일 뿐 장기적인 의존 대상이 아닌 것으로 취급한다 — 구현과 이 repository의 문서가 그 원래 문서들과 어긋나는 경우, repository가 우선한다(`.ai/constitution/documentation-policy.md` 참고).

## Consequences

### Positive

- 새로운 세션과 다른 agent들이 원래의 init prompt나 design spec 없이도 작업을 이어갈 수 있다.
- 공유 정책이 하나의 source를 가지게 되어, `AGENTS.md`와 `CLAUDE.md` 사이의 adapter drift가 줄어든다.
- 결정, working state, task prompt가 각각 별도의 lifetime과 책임을 가진다.

### Costs and risks

- 코드와 문서를 함께 유지 관리해야 하며, 그렇지 않으면 repository는 더 이상 신뢰할 수 있는 context가 아니게 된다.
- bootstrap 순서를 무시하는 agent는 중요한 context를 놓칠 수 있다.
- Markdown 규칙만으로는 준수를 보장할 수 없다 — 절대 위반해서는 안 되는 규칙(예: Live Lab에 임의의 URL 입력을 절대 구현하지 않는 것)에는 나중에 deterministic한 gate(test, lint, CI)가 필요할 것이다.

## Alternatives considered

### 원래의 init prompt를 working spec으로 유지

시작하기는 간단하지만, 두 source document는 처음부터 야심 찬 full scope를 서술하고 있어 실제 구현 phase와 점점 어긋나게 될 것이다 — 이는 정확히 repository-first context가 막고자 하는 실패 양상이다. Rejected.

### Agent별 문서를 독립적인 source로 사용

도구별 최적화는 쉬워지지만 `AGENTS.md`와 `CLAUDE.md` 사이에 정책 중복과 drift가 생긴다. Rejected.
