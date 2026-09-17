> 이 문서는 [`ADR-0002-relayhub-http-adapter-contract.md`](ADR-0002-relayhub-http-adapter-contract.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0002: RelayHub HTTP Adapter Contract (Interface Readiness Only)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

RelayHub Live Lab(`/lab/relayhub`)은 전적으로 `RelayHubAdapter` interface(`docs/architecture/overview.md`, "Adapter pattern")를 기준으로 만들어져 있으며, 현재는 `MockRelayHubAdapter`만 이를 구현합니다. Roadmap(`docs/status/current-state.md`)의 Phase 4는 "`HttpRelayHubAdapter` interface readiness only, no real backend call yet"를 요구합니다 — UI와 adapter 경계는 real API가 존재하기 전에 그것을 받아들일 준비가 되어 있어야 하며, 그것이 존재한다는 거짓 주장을 만들어서는 안 됩니다.

오늘 시점에는 배포된 real RelayHub demo API가 없습니다. `relayhub-java`는 별도로 배포된 real 프로젝트입니다만(`/projects/relayhub` 참고), 그 실제 admin/API surface를 이 repository가 해당 프로젝트의 명시적인 contract 없이 가정하거나 그것에 묶여서는 안 됩니다.

## Decision

- `RelayHubAdapter`를 구현하는 `HttpRelayHubAdapter`(`src/lib/relayhub/http-adapter.ts`)를, 코드 안에 조용히 가정으로 굳히지 않고 결정으로서 여기에 문서화된 작고 명시적인 REST contract를 기준으로 추가한다.
  - `POST {baseUrl}/events`, body는 `GenerateEventInput` → `EventExecution`
  - `GET {baseUrl}/events?limit=10` → `EventExecution[]`
  - `GET {baseUrl}/events/{id}` → `EventExecution` (모든 요청 실패 시 adapter는 `undefined`를 반환하며, interface의 optional return과 일치)
  - `GET {baseUrl}/metrics` → `RelayHubMetrics`
  - `POST {baseUrl}/events/{id}/replay` → `EventExecution`
  - response body는 `src/lib/relayhub/types.ts`의 `EventExecution`/`RelayHubMetrics` 형태와 이미 일치한다고 신뢰한다 — 아직 검증할 real endpoint가 없으므로 runtime schema validation은 구현되어 있지 않다.
- Adapter 선택은 `src/lib/relayhub/service.ts`에 중앙화되어 있다: `NEXT_PUBLIC_RELAYHUB_ADAPTER=http`(`NEXT_PUBLIC_RELAYHUB_API_URL`도 설정)이면 `HttpRelayHubAdapter`로 전환되고, 그 외(오늘 production의 실제 상태인 설정하지 않은 경우 포함)에는 `MockRelayHubAdapter`가 유지된다. 이 선택은 Client Component(`RelayHubLab`)에서 이루어지기 때문에 `NEXT_PUBLIC_`이 필요하며, Next.js에서는 `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 브라우저 bundle에서 사용 가능하다.
- 이 contract는 real backend가 이를 구현하기 전까지 잠정적이며 이 repository가 소유한다. `relayhub-java`가 정확히 이 route들을 노출하거나 노출할 것이라는 주장이 아니다.

## Consequences

### Positive

- UI/adapter 경계(`docs/architecture/overview.md`의 "Constraints agents must preserve")가 단순히 글로만 주장되는 것이 아니라 두 번째 real 구현으로 검증된다 — 향후 real backend는 이를 구현할 구체적인 목표를 가지게 되거나, 어떤 backend도 이에 commit하기 전에 이 contract를 수정할 수 있다.
- Production 동작은 변경되지 않는다: 기본값은 여전히 `MockRelayHubAdapter`이므로, 이 ADR을 shipping해도 운영상의 위험이 없다.

### Costs and risks

- 위의 contract는 real backend가 존재하기 전까지는 추측에 불과하다 — 여기 있는 모든 필드와 route 이름은 accepted된 후속 ADR이 실제 배포된 backend를 여기에 연결하기 전까지는 stable한 public API가 아니라 제안으로 취급한다.
- 아직 runtime response validation이 없다 — `EventExecution`/`RelayHubMetrics`와 가깝지만 정확히 일치하지 않는 형태를 반환하는 real backend는 adapter 경계가 아니라 UI 깊숙한 곳에서 조용히 실패하거나 throw될 수 있다. `NEXT_PUBLIC_RELAYHUB_ADAPTER=http`를 real deployment에 대해 설정하기 전에 다시 검토할 것.

## Alternatives considered

### Real backend가 존재할 때까지 HTTP adapter 코드를 전혀 작성하지 않고 기다린다

실제 필요가 생기기 전까지 codebase를 더 작게 유지할 수 있지만, "가장 작고 일관된 변경" 원칙을 이것을 아예 건드리지 않는 것으로만 만족시키게 된다 — roadmap(design spec §9, "Real API Ready")이 real backend가 실제로 출시되는 시점과는 별개로 adapter-interface readiness를 하나의 독립된 phase로 명시적으로 요구하기 때문에 rejected.

### Contract를 문서화하지 않고 adapter의 method signature 자체가 말하도록 둔다

interface(`RelayHubAdapter`)는 이미 parameter/return 형태를 문서화하지만, interface가 표현할 수 없는 부분 — HTTP verb, path, env var 이름, "잠정적이며 실제 배포된 contract가 아니다"라는 명시적 주의사항 — 을 위해서는 여전히 ADR이 필요하다. 그것만으로는 불충분하다고 판단되어 rejected.
