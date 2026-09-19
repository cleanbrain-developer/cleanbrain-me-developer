> 이 문서는 [`agent-context-model.md`](agent-context-model.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다. Agent bootstrap은 이 번역본이 아니라 영어 원본을 읽습니다.

# Agent Context Model

## Context 분류

### Permanent context

프로젝트 목적, 범위, architecture, engineering 원칙, 합의된 결정 등 세션 간에 지속되는 정보입니다. `PROJECT.yaml`, `.specify/memory/constitution.md`, `.ai/constitution/documentation-policy.md`, product/architecture 문서, ADR에 저장합니다.

### Working context

현재 phase, 최근 완료된 작업, 다음 조치, 미결 결정 등 진행 상황에 따라 변하는 정보입니다. `docs/status/current-state.md`에 저장합니다.

이 프로젝트가 이후 feature별 design document(예: RelayHub Lab이나 향후 real backend 통합을 위한 `specs/<feature>/` convention)를 갖추게 된다면, 각 문서 고유의 status marker 또한 working context입니다: 해당 문서가 설명하는 feature의 상태가 바뀌는(구현됨, 배포됨, 대체됨) 순간, `current-state.md`와 동일한 원칙으로 업데이트되어야 합니다. feature가 이미 출시되었는데도 "아직 구현되지 않음"이라고 계속 적혀 있는 design document는 역사적 기록이 아니라 낡은 working-context source입니다.

### Task context

현재 사용자 요청, 관련 코드, 임시 research 결과입니다. 필요할 때만 로드합니다. 지속적인 가치를 갖게 되면 적절한 permanent 또는 working source에 저장합니다.

## Bootstrap 순서

1. `AGENTS.md`(유일한 adapter — `agent-dev-starter`의 `ADR-0011`)에서 시작한다.
2. `PROJECT.yaml`을 읽어 프로젝트와 phase를 파악한다.
3. `.specify/memory/constitution.md`(그리고 문서 관련 사항은 `.ai/constitution/documentation-policy.md`)를 읽어 behavioral boundary를 이해한다.
4. product 문서(`docs/product/`)를 읽어 목적과 범위를 이해한다.
5. architecture 문서(`docs/architecture/`)를 읽어 구조와 책임을 이해한다.
6. 현재 작업과 관련된 accepted ADR(`docs/decisions/`)을 읽는다.
7. `docs/status/current-state.md`를 읽어 현재 위치와 다음 작업을 파악한다.
8. 요청과 관련된 repository 근거(source tree, 요청이 deployment와 관련되면 `docs/infra-required-changes.md`)를 확인한다.
9. 계획을 세우고, 변경하고, 검증하고, review한다.
10. durable한 결정과 working-state 변경 사항을 repository에 저장한다.

## Conflict handling (충돌 처리)

- 사용자 요청은 작업 목표를 정의하지만, 합의된 architecture를 조용히 무시하지는 않는다(예: public Lab에 real network call을 구현하거나 임의의 URL 입력을 추가하는 것을 정당화하지 않는다).
- 구체적인 accepted ADR은 일반적인 architecture 설명보다 우선한다.
- Current state는 원칙이나 설계를 재정의하지 않는다.
- 미해결 충돌은 가정으로 감추지 말고 보고한다.

## Bootstrap acceptance test

깨끗한 세션에서, 외부 link 없이 entry adapter만 제공한다. `docs/product/goals.md`("Success criteria")의 다섯 가지 acceptance question에 agent가 모두 답할 수 있고, 모든 답이 repository 문서로 추적 가능하면 context 복구가 성공한 것이다.
