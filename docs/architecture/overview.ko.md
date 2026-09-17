> 이 문서는 [`overview.md`](overview.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Architecture Overview

## Architectural style

developer.cleanbrain.me는 Next.js (App Router, TypeScript) 애플리케이션입니다. Server Component가 기본이며, Client Component는 interactivity가 필요한 곳(주로 `/lab/relayhub`, `/`의 redirect를 통한 사이트의 front door)에서만 사용됩니다. database도, custom backend server도 없으며 — ADR-0005 이후로는 — mock/simulation layer도 없습니다: `/lab/relayhub`는 relayhub-java의 실제 production telemetry를 직접 읽으며, 여기에는 live SSE stream(ADR-0004의 "Update")도 포함됩니다. ADR-0002(원래 build의 Phase 3–4)에서 나온 `RelayHubAdapter`/`MockRelayHubAdapter`/`HttpRelayHubAdapter` interface들은 완전히 제거되었습니다 — 이유는 ADR-0005 참고.

```text
src/content/*.ts (profile, experience, projects, case studies)
    ↓
Server Components (app/**/page.tsx)
    ↓
Presentation components (src/components/**)
```

```text
LiveTopology (Client Component)         LiveDashboard (Client Component)
    ↓ EventSource (SSE)                     ↓ fetch (poll every 10s)
    ↓ + one-time fetch                      ↓
src/lib/relayhub/live-topology.ts       src/lib/relayhub/live-observability.ts
    ↓                                       ↓
relayhub-java's public REST + SSE endpoints (real, cross-origin, both)
```

## Layers (계층)

### Content

`src/content/`에는 포트폴리오 콘텐츠의 단일 source인 구조화된 TypeScript module(`profile.ts`, `experience.ts`, `projects.ts`, `case-studies/*.ts`)이 있습니다. Presentation component는 이 module들을 읽으며, 프로젝트나 case-study 텍스트를 inline으로 정의하지 않습니다.

### RelayHub Live

`src/lib/relayhub/`는 남아 있는 유일한 RelayHub 관련 domain code이며, 하나가 아니라 두 개의 독립적인 real(mock이 아닌) 통합입니다.

- `live-topology.ts` + `live-topology.tsx`: 눈길을 끄는 주요 view입니다. `relayhub-java`의 `/api/live/stream`에 대해 실제 cross-origin `EventSource`를 열고 애니메이션이 적용된 Source → Event → RelayHub → Target diagram(pulse, impact explosion, node-hit shake)을 렌더링합니다 — 해당 repo 자체 admin-console의 Live 페이지(`frontend/src/pages/LivePage.tsx`)를 이 사이트의 테마로 재색상화하여 이식(port)한 것입니다. 또한 diagram을 배치하고 DLQ countdown을 구동하기 위해 mount 시 한 번 `/api/sources`, `/api/subscriptions`, `/api/dlq/schedule`을 fetch합니다. ADR-0004의 "Update (2026-09-13)" 참고.
- `live-observability.ts` + `live-dashboard.tsx`: topology 아래의 보조 "Aggregate stats" section입니다. `relayhub-java`의 delivery-summary와 Prometheus 기반 metrics endpoint를 10초마다 polling하여 KPI tile과 `Sparkline`(`sparkline.tsx`, 별도 의존성 없이 inline-SVG로 만든 작은 line chart — charting library 미사용)을 렌더링합니다. `parseInstantValue`/`parseRangeSeries`는 Prometheus의 JSON response 형태를 이 앱의 type으로 재구성하는 순수하고 unit-test된 함수입니다.

둘 다 adapter interface나 mock 구현이 없습니다 — 둘 다 상호교환 가능한 backend를 가진 시뮬레이션 파이프라인이 아니라, real system에 대한 단방향 read-only view입니다(이전의 `RelayHubAdapter`/`MockRelayHubAdapter`가 제거된 이유는 ADR-0005 참고).

### Presentation

`src/components/`는 feature 영역(`layout/`, `navigation/`, `portfolio/`, `project/`, `case-study/`, `relayhub/live-observability/`)별로 구성됩니다. 실제 interactivity(polling, client-side refresh)가 필요한 component만 Client Component입니다.

## External integrations (외부 통합)

`english-core-speaking`은 `/projects` 콘텐츠에서 나가는 link로만 참조됩니다 — 이 애플리케이션은 그 API를 호출하거나, session을 공유하거나, 그 runtime 가용성에 의존하지 않습니다.

`relayhub-java`는 다릅니다 — load-bearing한, 이 사이트에서 가장 중요한 외부 의존성입니다: `/lab/relayhub`(`/`가 그쪽으로 redirect하므로 사이트의 front door)는 브라우저에서 직접 실제, public, read-only endpoint를 호출합니다 — 일회성 fetch(`/api/deliveries/summary`, `/api/targets`, `/api/subscriptions`, `/api/sources`, `/api/dlq/schedule`, `/api/metrics/query(_range)`)와 탭이 그 페이지에 머무는 동안 유지되는 지속적인 Server-Sent Events connection(`/api/live/stream`) 둘 다입니다. 이것은 real runtime dependency입니다: `relayhub-java`를 사용할 수 없으면 영향받는 component는 페이지를 crash시키는 대신 명시적인 error/retry state를 보여주지만, 그 서비스의 uptime과 정확한 API/metric-name/event-shape에 실제로 결합되어 있습니다(ADR-0004의 "Costs and risks"와 그 "Update" 참고).

## Deployment target

애플리케이션은 static export(`next.config.ts`의 `output: "export"`)로 빌드되어 `nginx:1.27-alpine`이 서빙합니다 — production에는 실행 중인 Node server가 없습니다(ADR-0003 참고; 모든 route는 static이거나 `generateStaticParams` 기반이며, Live Monitoring dashboard는 전적으로 client-side입니다). 이 image는 `cleanbrain-me-infra` Kubernetes cluster 안, `cleanbrain-me-developer` namespace convention 아래에서 실행되며, 새로운 cluster-level 리소스를 프로비저닝하지 않고 cluster의 기존 Gateway(`cleanbrain-me-gateway`)를 공유합니다. Kubernetes manifest 자체는 이 repository가 아니라 `cleanbrain-me-infra`에 있습니다 — infra 변경이 필요해 보이는 것은 여기서 직접 구현하지 않고 `docs/infra-required-changes.md`에 기록합니다.

## Agent가 보존해야 할 제약 사항

- Content-driven: 포트폴리오 콘텐츠는 `src/content/`에 있으며, component에 하드코딩하지 않는다.
- No mock/simulation UI: ADR-0005에 따라, 이 사이트에 합성 "이벤트 생성" 기능을 재도입하지 않는다. demo/simulation 필요성이 다시 생기면, 삭제된 Phase 3 코드를 되살리는 것이 아니라 자체 ADR이 필요한 새로운 결정으로 취급한다.
- `relayhub-java` 통합은 read-only이며 좁은 범위를 유지한다: `LiveTopology`와 `LiveDashboard` 어느 쪽도 `relayhub-java` 상태를 mutate할 수 있는 요청을 절대 보내서는 안 되며, 둘 중 하나가 읽는 새로운 endpoint는 이미 `**`로 커버된다고 가정하지 말고 해당 서비스의 CORS allowlist에 의도적으로 추가해야 한다(ADR-0004 참고).
- 기본적으로 Server Component이며, Client Component 경계는 편의가 아니라 실제 interactivity로 정당화되어야 한다.
- V1에는 global state-management library, CMS, database, auth가 없다(`docs/product/scope.md` 참고).
- 대상 cluster는 2 vCPU / 4 GB RAM / 40 GB disk이다(`cleanbrain-me-infra` 기준) — 서빙되는 build와 그 container의 runtime footprint를 최소한으로 유지한다.
