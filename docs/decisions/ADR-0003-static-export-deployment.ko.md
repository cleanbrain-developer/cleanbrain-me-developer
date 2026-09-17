> 이 문서는 [`ADR-0003-static-export-deployment.md`](ADR-0003-static-export-deployment.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0003: Static Export Deployment (nginx, not a Node Server)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

이 애플리케이션의 모든 route(`docs/status/current-state.md`의 Phase 1–5 작업)는 완전히 static이거나 `generateStaticParams`를 통해 statically generate됩니다 — API route도, server-only data fetching도, middleware도 없으며, 유일한 interactive feature인 RelayHub Live Lab조차 전적으로 client-side입니다(`MockRelayHubAdapter`는 브라우저에서 실행됨; `docs/architecture/overview.md` 참고). 이 애플리케이션의 어떤 것도 request 시점에 실행 중인 Node server를 실제로 필요로 하지 않습니다.

`cleanbrain-me-infra`의 cluster budget(2 vCPU / 4 GB RAM, 해당 repository의 README 기준)은 배포된 모든 서비스가 공유합니다. `cleanbrain-me-entrance`는 이미 server-side 요구사항이 없는 프로젝트를 위한 더 가벼운 패턴을 확립했습니다: request당 Node process를 실행하는 대신 static bundle을 빌드하여 `nginx:alpine`으로 서빙하는 방식입니다.

## Decision

- `next.config.ts`에 `output: "export"`를 설정한다. 이제 `next build`는 `next start`를 요구하는 대신 static `out/` 디렉터리를 생성한다.
- 해당 디렉터리를 `nginx:1.27-alpine`(`Dockerfile`)에서 서빙한다 — container 안에서 `next start`를 실행하는 대신 `cleanbrain-me-entrance`의 deployment 형태와 일치시킨다.
- `nginx.conf`는 `cleanbrain-me-entrance`의 `try_files $uri $uri/ /index.html;`이 아니라 `try_files $uri $uri.html $uri/ =404;`를 사용한다 — `next export`는 `<route>/index.html`이 아니라 `<route>.html` 파일을 생성하며, 이 사이트에는 매치되지 않는 path를 넘겨줄 client-side router fallback이 없다(모든 real route가 pre-render되어 있으며, 매치되지 않는 path는 진짜 404이고, Next의 자체 생성된 404 페이지를 사용하는 `error_page 404 /404.html;`을 통해 서빙된다).
- `/lab`(`src/app/lab/page.tsx`)은 `next/navigation`의 `redirect()`에서 `/lab/relayhub`로 link하는 real한 얇은 landing page로 변경되었다. Static export에서는 `redirect()`가 client-side hydration 이후에만 적용되는데(HTTP redirect를 발급할 server가 없으므로), 이는 crawler나 no-JS client에게 real한 콘텐츠 대신 빈/오류 shell을 보여주게 된다 — real page는 redirect를 흉내내려 하지 않고 이를 완전히 우회한다.

## Consequences

### Positive

- production에서 이 애플리케이션을 위해 실행되는 Node process가 없다 — 공유되는 2 vCPU / 4 GB cluster에서 더 작고 예측 가능한 resource footprint를 가지며, patch/monitor해야 할 runtime이 하나 줄어든다.
- Deployment 형태가 이제 `cleanbrain-me-entrance`의 전례와 일치하며, `cleanbrain-me-infra`는 이미 그것을 운영하는 방법을 알고 있다(GHCR image, `ci-deployer` RBAC, 공유 Gateway에 대한 HTTPRoute).
- commit 전에 end to end로 검증했다: 실제 Docker image를 빌드하고, container를 실행하고, `curl`로 모든 route가 2xx를 반환하는지, 매치되지 않는 path가 custom page로 올바르게 404가 되는지, static asset이 long-cache header를 갖는지 확인했다 — 또한 headless-browser pass로 이렇게 서빙될 때도 RelayHub Lab이 여전히 완전히 interactive함을 확인했다.

### Costs and risks

- `HttpRelayHubAdapter`(ADR-0002)가 언젠가 활성화되면, 이를 라우팅할 server-side proxy가 없으므로 브라우저에서 real API를 직접 호출하게 된다 — 그 real API는 `developer.cleanbrain.me`로부터의 CORS를 지원해야 한다. `HttpRelayHubAdapter`가 production에서 활성화되어 있지 않은 오늘은 blocker가 아니지만, 향후 어떤 real backend에도 적용되는 제약이다.
- 향후 진짜 server-side rendering, API route, middleware에 대한 요구사항이 생기면 이 결정을 되돌려야 한다(`output: "export"`를 제거하고 다시 Node runtime container로 옮기는 것) — 현재로서는 가능성이 낮지만 real한 미래의 비용이다.
- 모든 route는 계속 statically generate 가능해야 한다. request당 server logic이 필요한(단순히 client-side interactivity가 아닌) 향후 feature는 추가되기 전에 새 ADR이 필요하다.

## Alternatives considered

### Node container에서 `next start`를 유지한다 (Phase 1–4의 가정)

`docs/architecture/overview.md`의 "Deployment target" section이 원래 설명했던 방식이다. 동작은 하지만, request 시점에 server-side 작업을 전혀 하지 않는 사이트를 위해 idle Node server를 실행하게 된다 — 실제 요구사항이 정당화하는 것보다 무거운 footprint이며, 동일한 종류의 workload에 대해 `cleanbrain-me-entrance`가 확립한 더 가벼운 전례와도 일치하지 않는다. static-export 경로가 end to end로 동작함이 확인된 후 rejected.
