> 이 문서는 [`scope.md`](scope.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Scope

## V1 in scope (P0)

- App shell, navigation, layout, dark-first theme, 공통 component.
- `/`는 `/lab/relayhub`로 redirect한다(client-side, ADR-0003의 static-export 제약 기준) — RelayHub Live Monitoring dashboard가 front door이며, 포트폴리오 narrative가 아니다. 이전 홈페이지 콘텐츠(hero, engineering focus, featured projects, live monitoring teaser, selected case studies, architecture/platform snapshot, resume/contact)는 대신 `/profile`에 있으며, header logo를 통해 도달할 수 있다.
- `/projects`와 `/projects/relayhub`, `/projects/english-core-speaking`(route와 content schema; content는 얇게 시작할 수 있지만, 조작된 결과는 없다).
- `/lab/relayhub`: `LiveDashboard` — `relayhub-java`로부터 직접 읽는 real하고 live한 production telemetry(delivery summary, DLQ count, targets, ingress-rate와 delivery-outcome sparkline)로, 10초마다 자동으로 refresh된다(ADR-0004 참고). 이 사이트에는 이제 합성/mock 시뮬레이션이 없다 — 원래의 interactive Mock Lab(Event Generator, Live Pipeline, mock Metrics, Recent Events, Event Detail, DLQ Replay)이 왜 제거되었는지는 ADR-0005 참고.
- 최소 하나의 real한 `/case-studies/[slug]` entry, 회사/고객 정보는 추상화됨.
- 위 모든 것에 대한 responsive layout(desktop, tablet, mobile)과 keyboard/accessibility 지원.
- `nginx:alpine`이 서빙하는 static export(`output: "export"`) — production에 Node server가 없음(ADR-0003 참고).

## V1 out of scope

- 어떤 Kubernetes, K3s, DNS, TLS/certificate, Gateway, Cloudflare, CI/CD *infrastructure* 변경도 포함되지 않는다 — 이 repository는 오직 애플리케이션 source, Dockerfile, CI workflow만 소유한다. infra 요구사항으로 보이는 것은 여기서 직접 구현하지 않고 `docs/infra-required-changes.md`에 기록한다.
- 어떤 합성/mock 시뮬레이션 UI("Event Generator", 조작된 pipeline 시각화 등)도 포함되지 않는다 — ADR-0005에 의해 완전히 제거되었다. demo/simulation 필요성이 다시 생기면 삭제된 코드를 되살리는 것이 아니라 자체 새로운 결정이 필요하다.
- CMS, global state-management library, authentication, database는 포함되지 않는다.
- 이 사이트에서 `relayhub-java`로 향하는 어떤 write/mutating call도 포함되지 않는다 — live 통합(ADR-0004)은 엄격히 read-only다(`GET`만, 이미 public한 몇 개의 endpoint로 CORS 범위가 한정됨). 임의의 URL 입력, 임의의 header 입력, 임의의 script/code 실행, secret/credential 입력은 mock Lab의 존재 여부와 무관하게 이 사이트 어디에서도 out of scope로 남는다.
- real한 회사 이름, real한 고객 데이터, real한 order/ticket ID, real한 internal system ID, 어떤 production credential도 콘텐츠나 코드 어디에도 포함되지 않는다.
- `/experience`, `/architecture`, `/resume`, `/contact`, 그리고 English Core Speaking의 전체 콘텐츠는 P1이다 — V1에서 route와 content-schema는 준비되지만 feature-complete일 필요는 없다.

## Scope rule

out-of-scope 항목은 향후 확장을 막지 않을 정도로만 고려합니다. 실제 요구사항이 생기기 전에 placeholder 화면, 사용되지 않는 config 옵션, 추측성 abstraction을 추가하지 않습니다 — 이는 정확히 ADR-0005가 사용되지 않는 `RelayHubAdapter`/`HttpRelayHubAdapter` machinery를 "혹시 몰라서" 남겨두는 대신 제거할 때 적용한 논리입니다.

## Open decisions

- `/case-studies`와 `/projects`의 P0 범위를 넘어서는 정확한 routing 깊이(init prompt §5는 Profile / Projects / Engineering Lab / Case Studies / Architecture 정보 구조가 유지되는 한 더 간결한 URL 구조를 허용함 — "Engineering Lab"은 이제 시뮬레이션이 아니라 real한 Live Monitoring dashboard다).
- 다른 relayhub-java endpoint/metric을 나중에 dashboard에 노출할 가치가 있는지, 그리고 CORS allowlist(ADR-0004)가 이를 커버하도록 확장되어야 하는지 — 각 추가는 포괄적인 `**` grant가 아니라 의도적이어야 한다.
- `cleanbrain-me-entrance`의 이 프로젝트에 대한 `Service.status`가 개발 중에는 `planned`여야 하는지, 아니면 이 사이트가 실제로 live된 후에만 추가되어야 하는지(pre-launch entry 표시에 대한 `cleanbrain-me-entrance` 자체의 open decision과 대응) — 이 사이트가 이미 해당 entry가 추가된 채 live 상태이므로 이제는 무의미하다.
