> 이 문서는 [`ADR-0004-live-relayhub-observability.md`](ADR-0004-live-relayhub-observability.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0004: Live RelayHub Observability (Real Cross-Origin Data, Not Mocked)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

RelayHub Live Lab(`/lab/relayhub`)은 설계상(ADR-0002, `docs/product/scope.md`) `MockRelayHubAdapter`가 뒷받침하는 client-side simulation입니다 — 결코 real backend를 호출하지 않습니다. 이는 interactive demo로서는 맞지만, 이 페이지는 real RelayHub deployment가 존재하고 이렇게 동작한다는 것을 실제로 증명하지 못하며, 그저 글로만 주장할 뿐입니다("이 페이지의 모든 데이터는 합성 데이터입니다 — 이것이 시뮬레이션하는 real한 live system은 RelayHub 프로젝트 페이지를 참고하세요").

`relayhub-java`(별도로 배포된 real 프로젝트, `relayhub-java.developer.cleanbrain.me`)는 이미 여러 public하고 인증이 필요 없는 read-only GET endpoint를 노출하고 있습니다(해당 repo의 `security/SecurityConfig.java` 참고): `/api/deliveries/summary`(succeeded/pending/dead count), `/api/targets`(demo delivery target과 그 동작), `/api/metrics/query`/`query_range`(자체 admin console의 chart가 사용하는, Prometheus instance에 대한 얇은 public proxy), `/actuator/health`. 이 모든 데이터는 그 URL을 브라우저에서 직접 열어보면 이미 볼 수 있었습니다 — 없었던 것은 `developer.cleanbrain.me`의 JavaScript가 이를 `fetch()`할 수 있는 능력뿐이었으며, 브라우저는 CORS response header가 없으면 기본적으로 다른 origin에 대해 이를 차단합니다.

## Decision

- `relayhub-java`의 `SecurityConfig`(해당 repository)에 `CorsConfigurationSource` bean을 추가하여, 정확히 `https://developer.cleanbrain.me`로부터의 `GET` 요청을 `/api/deliveries/**`, `/api/targets/**`, `/api/metrics/**`, `/actuator/**`에 대해 허용한다. 다른 origin, 다른 HTTP method, 추가 endpoint는 열리지 않는다. 이는 어떤 데이터가 public인지를 바꾸는 것이 아니라, 어떤 origin이 JavaScript를 통해 이미 public한 데이터를 읽을 수 있는지를 바꾸는 것이다.
- 이 repository에 `src/lib/relayhub/live-observability.ts`를 추가한다: 브라우저에서 직접 저 endpoint들을 읽는 단순한 `fetch()` 기반 함수(`fetchRelayHubLiveObservability`)이다. 이는 의도적으로 `RelayHubAdapter`의 구현이 **아니다** — 그 interface는 interactive Lab의 `generateEvent`/`replayDlq` 등의 lifecycle을 위해 존재하며, 이것은 그에 해당하는 것이 없다(이것은 시뮬레이션된 pipeline 실행이 아니라 read-only telemetry다). 이를 그 interface를 통과시키면 Mock/Http와 나란히 있는 또 다른 "adapter" 선택지로 잘못 표현하게 될 것이다 — 실제로는 완전히 다른 관심사, 즉 별도의 production 서비스에 대한 real하고 live하며 단방향인 view이기 때문이다.
- `LiveObservabilityPanel`(`src/components/relayhub/live-observability/`)로 이를 렌더링하며, `/lab/relayhub`의 Mock Lab 아래에 "Beyond the simulation" heading으로 배치하고, 그 자체의 명확히 구분되는 "Live · real data" badge를 가진다 — Mock Lab의 "Synthetic demo data" badge와 시각적 언어를 절대 공유하지 않아, 방문자가 둘을 혼동할 수 없다.

## Consequences

### Positive

- 이 사이트는 이제 real RelayHub deployment에 real한 delivery/DLQ/target 상태가 존재한다는 것을 단순히 주장하는 것이 아니라 보여줄 수 있다 — 이는 이 사이트 자체의 "Evidence over Claims" product thesis(`docs/product/overview.md`)와 일치하는 직접적인 근거다.
- CORS grant는 최소한이며 감사 가능하다: 하나의 origin, 하나의 HTTP verb, 네 개의 path prefix — 모두 브라우저로 직접 방문하면 이미 public하다. 새로운 capability를 만드는 것이 아니라, 기존 capability를 읽는 더 좁은 방법을 만들 뿐이다.

### Costs and risks

- **이전에는 없던 repository 간 결합.** `developer.cleanbrain.me`는 이제 `relayhub-java`의 특정 API 형태(`/api/deliveries/summary`의 필드 이름, `/api/targets`의 형태, `relayhub_ingress_events_total`이 사용하는 정확한 PromQL metric 이름)에 대해 real하지만 좁은 runtime 의존성을 가진다. 이 의존성을 인지하지 못한 상태로 `relayhub-java`의 API surface가 breaking change를 겪으면 이 panel이 조용히 깨질 수 있다. `LiveObservabilityPanel`은 페이지를 crash시키는 대신 명시적인 error + retry state로 degrade하지만, 근본적인 결합은 real하며 이 ADR과 그 자체의 `SecurityConfig.java` comment 외에는 `relayhub-java` 쪽에 문서화되어 있지 않다.
- **가용성 결합.** `relayhub-java`가 다운되거나, 재배포 중이거나, 부하가 걸리면 이 panel은 error state를 보여준다 — 이는 받아들일 만하지만(`docs/product/scope.md`의 "Error UX" 기대와 일치) 언급할 가치가 있다: 이는 이 사이트 자체의 uptime이 다른 서비스의 uptime에 영향을 받는 첫 사례이며, 하나의 non-critical panel에 한정된 것이라 해도 그렇다.
- **이 repository 쪽에는 caching도, rate limiting도 없다.** `/lab/relayhub`에 방문하는 모든 방문자는 `relayhub-java`에 대해 캐시되지 않은 세 번의 GET 요청을 발생시킨다. 오늘의 두 사이트 트래픽 수준에서는 문제가 아니지만, 이전에는 없던 real한 load path이며, 두 사이트 중 하나라도 트래픽이 의미 있게 늘어나면 기억해둘 가치가 있다.
- 이 ADR은 이 특정하고 좁은 통합만을 다룬다. `HttpRelayHubAdapter`(full request/response 시뮬레이션 backend)가 사용되지 않은 채로 남는다는 ADR-0002의 결정을 다시 열거나 재해석하지 않는다 — 그 adapter가 언젠가 활성화된다면, 이 read-only telemetry panel보다 훨씬 크고 다른 commitment가 될 것이다.

## Alternatives considered

### `<iframe>`을 통해 real admin console을 embed한다

Rejected: `relayhub-java`의 response는 `X-Frame-Options: DENY`를 가지고 있으며(live URL을 직접 요청하여 확인함), 이를 바꾸는 것은 이미 public한 몇 개의 GET endpoint에 대한 범위가 좁은 CORS allowlist보다 그 서비스에 훨씬 큰 security-posture 변화가 될 것이다.

### `developer.cleanbrain.me`의 server-side function을 통해 요청을 proxy한다

Rejected: 이 사이트는 의도적인 선택으로 server가 없는 static export이며(ADR-0003), 특히 server-side logic이 전혀 필요하지 않았기 때문이다. CORS header 문제를 우회하기 위해서만 server, edge function, Cloudflare Worker를 세우는 것은 하나의 feature를 위해 그 결정을 뒤집는 것이며, 이 cluster의 resource budget(`cleanbrain-me-infra`의 README, "Resource budget")에 뚜렷한 여유가 없어 보이는 새로운 infrastructure 조각을 추가하는 것이다. 이미 public한 API에 CORS header를 추가하는 것이 더 작고 더 정직한 해결책이다.

### 외부 link로만 남겨두고, embed된 데이터는 두지 않는다

더 단순하고 위험이 낮은 옵션으로, 진지하게 고려되었다 — 어떤 cross-repo 변경도 필요 없다. maintainer가 `developer.cleanbrain.me` 자체에 real 데이터가 보이기를, 단순히 link만 되는 것이 아니라 명시적으로 요청했기 때문에만 rejected되었다 — 이는 나중 세션이 이것이 두 가지 합리적인 옵션 사이의 의도적인 선택이었지 실수가 아니었음을 이해하도록 여기에 기록해둔다.

## Update (2026-09-13): 애니메이션 적용된 Live topology, 단순한 KPI tile이 아니다

이 ADR의 첫 버전은 `LiveObservabilityPanel` — KPI tile과 두 개의 range-query sparkline, static한 느낌의 요약 — 을 shipping했다. maintainer의 실제 요청은 방문자가 페이지에 도착하는 순간 시각적으로 시선을 사로잡는 것이었으며, `relayhub-java` 자체의 admin-console **Live** 페이지가 하는 방식과 같았다(해당 repo의 `frontend/src/pages/LivePage.tsx`: 애니메이션 "missile" pulse, impact explosion, node-hit shake 효과가 있는 real-time SSE 기반 topology diagram). 아무리 정확해도 static한 dashboard는 페이지가 로드되는 순간 "live"로 읽히지 않는다.

**결정, 확장됨:**

- `LivePage.tsx`의 topology 애니메이션을 이 repository로 `LiveTopology`(`src/components/relayhub/live-observability/live-topology.tsx`)로 이식했으며, `src/lib/relayhub/live-topology.ts`가 이를 뒷받침한다. `relayhub-java`의 `/api/live/stream`(Server-Sent Events)에 대해 real한 cross-origin `EventSource`를 열고, 동일한 pulse/explosion/shake 시각 언어를 가진 동일한 Source → Event → RelayHub → Target diagram을 렌더링하며 — relayhub-java가 아니라 이 사이트의 theme token으로 재색상화되어 있다.
- `relayhub-java`의 `CorsConfigurationSource`(동일한 bean, 동일한 origin, 여전히 `GET`-only)를 확장하여 `/api/sources/**`, `/api/subscriptions/**`, `/api/dlq/**`(diagram을 배치하고 DLQ auto-replay countdown을 보여주는 데 필요), `/api/live/**`(SSE stream 자체)도 포함하도록 했다.
- 이는 `relayhub-java` 페이지의 `<iframe>`이 아니라 **이 사이트에서 native하게 실행되는 이식(port)**이다 — 위에서 고려되고 rejected된 대안(`X-Frame-Options: DENY`)이 여전히 적용되며, 진짜로 same-site로 재구축하는 것이 그 외에도 더 강력한 포트폴리오 증명이라고 할 수 있다.
- 원래보다 의도적으로 좁다: login으로 gate된 demo-generator pause/resume control이 없으며(이 사이트에는 auth가 없고, ADR-0004의 "read-only, `GET`-only" 경계는 시각화가 커져도 유지되어야 함), activity feed에 click-through request/response 상세 내용도 없다.
- `LiveObservabilityPanel`의 KPI tile과 sparkline은 **삭제되지 않았다** — `LiveDashboard`로 이름이 바뀌어 유지되었으며, 이제 같은 페이지의 `LiveTopology` 아래에 있는 보조 "Aggregate stats" section이다. topology 애니메이션이 눈길을 끄는 주요 view이고, dashboard는 개별 이벤트가 날아다니는 것을 지켜보는 대신 추세/요약 숫자를 원하는 사람을 위해 남아 있다.

**이 update가 받아들이는 추가 비용:** topology view는 이전보다 `relayhub-java`의 더 많은 surface(`/api/sources`, `/api/subscriptions`, `/api/dlq/schedule`, 그리고 SSE event shape 자체)에 의존하며, 방문 탭이 열려 있는 동안 탭당 하나의 `EventSource` connection을 유지한다 — 단순한 polling dashboard는 만들지 않았던, 현재로서는 작지만 real한 persistent-connection load를 `relayhub-java`에 가한다.
