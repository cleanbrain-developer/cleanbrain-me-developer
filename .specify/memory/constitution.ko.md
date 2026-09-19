> 이 문서는 [`constitution.md`](constitution.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Constitution

이 문서는 GitHub Spec Kit가 사용하는 의미에서의 이 프로젝트의 constitution입니다: 이 repository의 모든 변경이 평가받는 durable한 원칙입니다. 이 문서는 예전의 `.ai/constitution/engineering-principles.md`를 대체하며(`docs/status/current-state.md`의 2026-09-20 V2 migration entry 참고, `agent-dev-starter`의 `ADR-0013`을 그대로 따름) — 이제 이 원칙들이 사는 유일한 곳입니다.

## 변경 전에 근거를 확인한다 (Evidence before change)

먼저 기존 문서와 구현을 확인한다. 가정보다 repository 근거를 우선하며, 검증되지 않은 구조를 전제로 변경을 제안하지 않는다.

## 최소한의 일관된 변경 (Minimal, coherent change)

요구사항을 충족하는 가장 작고 일관된 변경을 우선한다. 이 사이트는 실제 backend의 public telemetry를 읽는 live monitoring dashboard가 있는 포트폴리오 사이트이지, 그 자체로 production event-processing platform이 아니다 — 실제 요구사항이 강제하기 전까지는 이 사이트 자체의 실제 backend, database, authentication layer를 추가하지 않는다(`docs/product/scope.md` 참고). 사용되지 않는 Mock RelayHub Lab을 제거한 ADR-0005는 이 원칙이 가리키는 구체적인 전례다 — 확인된 미사용 코드는 "혹시 몰라서" 남겨두지 않고 삭제한다.

## 명시적인 architecture (Explicit architecture)

architectural boundary나 convention을 조용히 바꾸지 않는다. 장기적 영향을 미치거나 되돌리기 어려운 결정 — 예를 들어 이 사이트가 의존하는 `relayhub-java`의 CORS/API surface 확장(ADR-0004), 어떤 형태로든 mock/simulation UI 재도입(ADR-0005), CMS 추가, state-management library 추가 등 — 은 구현 전이나 구현과 함께 ADR로 기록한다.

## 검증 가능한 결과 (Verifiable outcomes)

검증 가능한 결과를 만든다. lint, typecheck, test suite가 존재하면 실행하고, 그렇지 않으면 검증 방법과 그 한계를 명시한다. 자동화된 check가 green인 것은 코드에 대한 근거이고, 실행 중인 앱에 대한 직접 검증(브라우저, 실제 route)은 현실에 대한 근거다 — UI나 interaction에 대한 주장을 할 때는 항상 후자를 우선한다.

## 코드보다 콘텐츠 (Content over code)

프로필, 경력, 프로젝트 설명, 케이스 스터디 등 포트폴리오 콘텐츠는 `src/content/` 아래에 있으며, presentation component 안에 하드코딩하지 않는다. 콘텐츠를 추가하거나 편집할 때 component를 건드릴 필요가 없어야 한다.

## RelayHub Live Monitoring 통합은 real, read-only, 좁은 범위를 유지한다

더 이상 지켜야 할 adapter/mock 경계는 없다(ADR-0005가 이를 제거했다) — `src/lib/relayhub/live-observability.ts`는 `relayhub-java`를 직접 호출한다. 대신 지켜야 할 것은: 모든 호출은 해당 서비스의 CORS allowlist(ADR-0004)에 이미 포함된 endpoint에 대해 `GET`-only이어야 하고; 이 사이트에서 `relayhub-java` 상태를 변경(mutate)할 수 있는 요청은 절대 보내지 않으며; 방문자로부터의 임의의 URL, header, script, credential 입력은 편의를 위해서든 "임시" 방편으로든 절대 구현하지 않는다(`docs/product/scope.md` 참고). 새로운 ADR이 명시적으로 그 질문을 다시 열지 않는 한, 합성 "이벤트 생성" UI를 재도입하지 않는다.

## 분리된 경계 (Separated boundaries)

domain 관심사(콘텐츠, `relayhub-java` live-telemetry client)를 외부 시스템 및 tooling(build tool, container runtime, Kubernetes deployment)과 분리해서 유지한다. Deployment와 infrastructure 관심사는 이 repository의 source tree가 아니라 `cleanbrain-me-infra` repository에 속한다.

## 재발명보다 표준을 우선한다 (Standards over reinvention)

이 repository가 `agent-dev-starter`의 standards-aligned V2 foundation으로 migration한 것에 따라(`docs/status/current-state.md` 참고), 밑바닥부터 동등한 메커니즘을 만들기보다 이미 확립된 open standard나 convention(`AGENTS.md`, GitHub Spec Kit, Agent Skills)을 우선한다. project-specific한 process, decision format, file convention을 추가하기 전에, 이미 open standard가 이를 해결하는지 먼저 확인한다.
