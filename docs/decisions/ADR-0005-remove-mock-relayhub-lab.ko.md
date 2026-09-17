> 이 문서는 [`ADR-0005-remove-mock-relayhub-lab.md`](ADR-0005-remove-mock-relayhub-lab.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0005: Remove the Mock RelayHub Lab; Live Monitoring Becomes the Front Door

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

이 프로젝트의 원래 build(init prompt와 design spec, 그리고 ADR-0002 기준)의 Phase 3–4는 interactive한 "RelayHub Live Lab"을 만들었습니다: 미리 정의된 Event Generator, 6단계 pipeline 시각화, 합성 metrics, 최근 이벤트 table, event-detail view, DLQ replay — 모두 `MockRelayHubAdapter`(client-side state machine)가 뒷받침하며, real backend를 위해 준비되었지만 결국 active adapter가 되지 못한 미사용 `HttpRelayHubAdapter` 구현(ADR-0002)도 함께 가진 `RelayHubAdapter` interface 뒤에 있었습니다.

이후 ADR-0004는 relayhub-java의 실제 production telemetry를 읽는 작은 real-data panel인 `LiveObservabilityPanel`을 그 Mock Lab 아래에 추가했습니다. 같은 페이지에 real 데이터가 보이게 되자 시뮬레이션의 존재 목적이 약해졌습니다: maintainer는 "Generate Event" flow가 실제로 사용되지 않고 있음을 확인했고, 이를 제거하고 real telemetry를 보조 panel에서 메인의 눈길을 끄는 경험으로 승격시켜 달라고 요청했습니다 — `/`(사이트 root)가 그쪽으로 바로 redirect되도록 하는 것도 포함해서요.

## Decision

- Mock Lab 전체를 삭제한다: `src/lib/relayhub/{adapter,mock-adapter,mock-adapter.test,http-adapter,service,scenarios,pipeline,pipeline.test,types}.ts`와 `src/components/relayhub/{event-generator,pipeline,metrics,recent-events,event-detail,dlq}/`, `relayhub-lab.tsx`. `RelayHubAdapter`, `MockRelayHubAdapter`, `HttpRelayHubAdapter`는 이 codebase에 더 이상 존재하지 않는다. ADR-0002의 잠정적인 HTTP contract는 이제 역사적 기록일 뿐이며 — 대체되었고 어떤 것에도 구현되어 있지 않다.
- `/lab/relayhub`를 `LiveDashboard`(`src/components/relayhub/live-observability/live-dashboard.tsx`) 중심으로 재구축한다: 큰 KPI tile(분당 Succeeded / Pending / Dead / Ingress events), 두 개의 `Sparkline` 시계열 chart(ingress rate, status별 delivery attempt — 둘 다 client-side에 누적된 sample이 아니라 real Prometheus range query), live delivery-targets list, 그리고 깜빡이는 "live" indicator. 전체 페이지 reload나 loading-state flash 없이 10초마다 auto-refresh되어, 페이지를 지켜보는 방문자가 실제 업데이트를 볼 수 있다.
- `src/lib/relayhub/live-observability.ts`는 `parseInstantValue`/`parseRangeSeries`를 순수하고, export되고, unit-test된 함수(`live-observability.test.ts`, real하게 캡처된 API response로부터 만든 fixture)로 확장했다 — 삭제된 `MockRelayHubAdapter`/`toPipelineSlots`에 대해 존재했던 unit-test coverage를 대체하여, Phase 5의 "첫 자동화 test suite" 투자가 그냥 사라지지 않도록 했다.
- `/`는 이제 이전 홈페이지가 아니라 `/lab/relayhub`로 redirect한다(routing 변경은 `docs/status/current-state.md`의 ADR-0004와 함께 기록됨) — Live Monitoring dashboard가 이제 사이트 전체의 front door이며, nav link로만 도달하는 보조 목적지가 아니다.
- 콘텐츠와 문구에 남아 있던 모든 "Live Lab" / "합성 이벤트 생성" 언급(`/architecture`, `/projects/relayhub`의 콘텐츠, nav label, `/lab` landing page)을, 페이지가 실제로 하는 일을 정확히 설명하는 "Live Monitoring" 프레이밍으로 교체했다.

## Consequences

### Positive

- real하지만 좁은 오해의 소지를 제거한다: RelayHub를 시뮬레이션하면서 동시에 RelayHub의 real 데이터를 보여주는 페이지는 정확히 사이트 전체의 "Evidence over Claims" thesis(`docs/product/overview.md`)가 피하고자 하는 "이게 real인지 fake인지" 혼란을 초래했다. 페이지당 하나의 명확한 데이터 source가 추론하고 신뢰하기 더 단순하다.
- 확인된 미사용 상태였던 상당한 양의 코드와 그에 딸린 인지적 부담(adapter interface, 두 개의 구현, scenario state machine, 여섯 개의 component 폴더)을 삭제한다 — 단순한 재구성이 아니라 real한 단순화다.
- 사이트에서 가장 눈에 띄는 자리(`/`)가 이제 static한 포트폴리오 페이지로 먼저 라우팅하는 대신 진짜 live system을 보여준다.

### Costs and risks

- 이는 원래 init prompt/design spec(`docs/product/scope.md`의 원래 "in scope" 목록, ADR-0002)의 P0 요구사항을 그 source document들을 다시 열지 않은 채 뒤집는 것이다 — `.ai/constitution/documentation-policy.md`("Authority")에 따라, repository의 현재 accepted된 결정이 원래 prompt와 어긋나면 repository가 우선하며, 이 ADR이 그 명시적인 기록이다.
- 이 사이트는 이제 **offline-safe한 demo가 없다**: `relayhub-java`가 다운되면, `/`(redirect를 통해)는 backend capability를 증명하는 어떤 콘텐츠 대신 error/retry state를 보여준다 — 이전에는 Mock Lab이 real backend의 가용성과 무관하게 동작했다. 이는 의도적인 trade-off로 받아들여졌다 — maintainer는 이 특정 페이지에 대해 보장된 uptime보다 real한 근거를 명시적으로 우선시했다.
- `docs/product/scope.md`의 "Demo safety" 원칙(임의의 URL/header/script 입력 금지)은 원래 Mock Lab의 `GenerateEventInput`을 위해 작성되었다 — 이제 이 페이지에는 이를 적용할 코드가 남아 있지 않지만, 향후 어떤 interactive feature가 추가되더라도 그 원칙 자체는 여전히 유효한 지침이다 — 삭제된 것이 아니라 현재는 적용되지 않을 뿐이다.
- 포트폴리오 narrative를 위해 `/`를 북마크한 사람은 이제 dashboard에 도착하게 된다. 해당 콘텐츠는 사라지지 않았지만(`/profile`), 그것을 발견할 수 있는지는 이제 전적으로 header logo에 달려 있다.

## Alternatives considered

### Mock Lab을 유지하되, real dashboard 아래로 덜 강조한다

이는 이 ADR 직전 ADR-0004의 실제 상태였다. maintainer가 시뮬레이션이 사용되지 않았음을 확인한 후 rejected되었다 — 확인된 dead code를 "혹시 몰라서" 유지하는 것은 `.ai/constitution/engineering-principles.md`의 "Minimal, coherent change" 원칙과 모순된다.

### `RelayHubAdapter`/`MockRelayHubAdapter`를 어떤 페이지에도 link되지 않더라도 code sample로 유지한다

Phase 3 작업을 그 자체로 포트폴리오 산출물로 보존하는 방법으로 잠시 고려되었다. Rejected: route도, nav link도, 앞으로 누구도 유지 관리하지 않을 test coverage도 없는 도달 불가능한 코드는 자산이 아니라 부채다(bit rot, 향후 세션의 혼란) — 이 작업이 언젠가 참고용으로 필요하다면 real GitHub history가 이미 이를 보존하고 있다.
