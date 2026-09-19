> 이 문서는 [`documentation-policy.md`](documentation-policy.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Documentation Policy

## Authority (권한)

> Conversation은 임시적이다. Repository가 authoritative하다.

Conversation과 외부 design document(원래의 init prompt와 이 프로젝트를 구성한 design spec 포함)는 bootstrap 입력일 뿐이다. durable한 합의는 repository에 저장되기 전까지는 완료된 것이 아니다.

## 단일 책임 (Single responsibility)

- 프로젝트 정체성과 구조화된 phase: `PROJECT.yaml`
- 제품 목적, 목표, 범위: `docs/product/`
- 구조와 context model: `docs/architecture/`
- 중대한 결정과 근거: `docs/decisions/`
- 현재 진행 상황, 다음 작업, 미해결 결정: `docs/status/current-state.md`
- 지속적인 engineering 원칙: `.specify/memory/constitution.md`(GitHub Spec Kit 자체의 constitution 역할)
- 문서 소유권과 `.ko.md` 언어 정책: 이 문서, `.ai/constitution/documentation-policy.md`
- Agent bootstrap adapter: `AGENTS.md`(모든 지원 agent를 위한 유일한 adapter)

동일한 정책을 여러 파일에 중복해서 두지 않는다. 요약이 유용한 경우, authoritative한 경로로 link한다.

## Decision records (결정 기록)

실제 RelayHub backend 통합 도입, deployment target, content/adapter architecture와 같이 장기적 영향을 미치는 선택은 `docs/decisions/` 아래 ADR로 기록한다. ADR에는 context, decision, consequences, status가 포함되어야 한다. accepted된 ADR은 다른 ADR이 이를 대체할 때까지 유효하다.

## Status hygiene (상태 위생)

`current-state.md`는 회의록이나 완전한 changelog가 아니다. 현재 phase를 재구성하는 데 필요한 완료된 작업, 진행 중인 작업, 다음 조치, 미해결 결정만 유지한다. 세션 경계에서뿐 아니라 shipped되어 검증된 모든 변경마다 업데이트한다.

## Maintenance (유지 보수)

코드나 구조 변경으로 문서가 사실과 달라지면, 같은 변경 안에서 문서를 업데이트한다. 낡은 지침은 제거하고, 이력을 보존해야 할 때는 ADR이나 version control을 사용한다.
