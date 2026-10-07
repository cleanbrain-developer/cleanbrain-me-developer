> 이 문서는 [`ADR-0006-front-door-restructure.md`](ADR-0006-front-door-restructure.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# ADR-0006: Root Page Becomes the Portfolio Front Door; Live Evidence Moves Inline

- Status: Accepted
- Date: 2026-09-28
- Deciders: cleanbrain.developer

## Context

ADR-0005는 `/`가 `/lab/relayhub`의 Live Monitoring dashboard로 바로 redirect되도록 만들었습니다 — 진짜로 live한 시스템이 정적인 portfolio 페이지보다 더 강력한 front door라는 판단, 그리고 기존 homepage 콘텐츠는 여전히 `/profile`에서 볼 수 있다는 근거였습니다.

maintainer의 후속 검토(상세한 UX/UI 개선 spec)에서, 실제 결과가 "이 사이트는 backend 엔지니어의 portfolio다"보다 "이 사이트는 RelayHub monitoring console이다"로 읽힌다는 점이 발견됐습니다. live 시스템에 접근하는 것도 필요 이상으로 한 단계가 더 걸렸습니다: `Header → Live → /lab (thin landing page) → "Open Live Monitoring" → /lab/relayhub` — ADR-0005 이후로 RelayHub가 유일한 Live 목적지였는데도 말이죠.

이 spec은 Live-first 전략 자체는 **유지**되어야 하고, 정적인 홈페이지로 되돌리는 방향이 아니라는 점을 명확히 하고 있습니다 — 고쳐야 할 것은 live 증거가 *존재하는지 여부*가 아니라 *어디에 위치하는지*입니다.

## Decision

- `/`(`src/app/page.tsx`)는 더 이상 client-side `redirect()`가 아닙니다. 이제 real하고 static한 콘텐츠입니다: Hero(role + tagline, 의도적으로 짧게 — 긴 `profile.summary` 문단은 대신 `/resume`/`/experience`에 남아 있음) 그리고 real한 succeeded/DLQ/events-per-minute 숫자와 real한 node 이름을 사용하는 축약된 topology preview를 보여주는 새 `LiveSignal` component(`src/components/portfolio/live-signal.tsx`) — 그 다음 순서로 예전 `/profile` 콘텐츠: Impact, Featured Projects, Engineering Focus, Selected Case Studies, Architecture snapshot, Resume/Contact.
- `LiveSignal`은 `fetchRelayHubLiveObservability()`, `fetchTopology()`, `openLiveActivityStream()`(모두 `src/lib/relayhub/{live-observability,live-topology}.ts`에서 이미 export되어 있음)을 재사용해서 data와 연결 상태를 가져옵니다. `LiveTopology`의 stateful pulse/explosion 애니메이션 엔진은 재사용하지 **않습니다** — 그건 `/lab/relayhub`에 그대로 남아 있고, 거기가 여전히 full하고 완전히 애니메이션되는 console입니다.
- `/profile`과 `/lab`(`src/app/{profile,lab}/page.tsx`)은 둘 다 ADR-0003이 바로 이 static-export trade-off를 위해 확립한 client-`redirect()` 패턴이 됩니다 — `/profile` → `/`, `/lab` → `/lab/relayhub` — 그래서 둘 중 어느 쪽으로의 기존 북마크/링크도 404가 나는 대신 계속 동작합니다. route 자체를 완전히 삭제하지는 않았습니다.
- `src/components/layout/site-header.tsx`: 로고는 이제 `/`로 연결됩니다(이전엔 `/profile`). "Live"라는 label로 `/lab`을 가리키던 nav 항목은 이제 "Live Systems"로 바뀌어 `/lab/relayhub`를 직접 가리켜서, 불필요한 한 단계를 없앴습니다.
- 새 `src/components/ui/` 디렉토리는 다섯 개의 작고 local하며 shadcn 스타일인 presentational primitive(`Button`, `Badge`, `Card`, `Separator`, `Skeleton`)를 담고 있으며, 이번 변경과 함께 도입되어 새 홈페이지와 header에서 사용됩니다 — 설치된 package가 아니고, 새로운 npm dependency도 없으며, Radix도 없습니다(다섯 개 모두 open/close state나 focus trapping이 필요 없습니다). 기존 페이지들(`/resume`, `/contact`, `/projects`, `/case-studies`, `/experience`, `/architecture`)은 아직 이 primitive들을 쓰도록 retrofit되지 않았습니다 — 그건 나중으로 미뤄졌고, `docs/status/current-state.md`의 "Next" section에 추적되고 있습니다.

## Consequences

### Positive

- root page가 이제 첫 viewport에서 identity와 evidence를 *둘 다* 보여줍니다, evidence만 보여주는 대신 — "monitoring console처럼 읽힌다"는 발견을 직접적으로 해결합니다.
- ADR-0005 자체가 문서화했던 비용("`/`를 portfolio narrative를 위해 북마크한 사람은 이제 dashboard에 도착한다")을 없애면서도, 애초에 ADR-0005를 만든 이유였던 live 증거는 포기하지 않습니다.
- `/`는 이제 client-redirect trade-off가 전혀 필요 없습니다(crawler/no-JS client가 이제 `<head>`와 `<body>` 양쪽에서 real 콘텐츠를 즉시 봅니다) — 단순히 위치만 옮긴 게 아니라 실질적인 단순화입니다. `/profile`과 `/lab`은 여전히 그게 필요하지만, 오래된 링크를 위한 thin한 호환성 redirect로서만 필요하므로, 전체 homepage가 그걸 짊어지는 것보다 비용이 작습니다.
- `LiveSignal`은 `LiveTopology`의 ~500줄짜리 stateful 애니메이션 엔진과 의도적으로 독립적이라서, 이번 변경은 `/lab/relayhub`에 어떤 regression 위험도 지니지 않습니다 — 그 파일은 바로 이번 주에 real production bug 두 개가 고쳐졌고(DLQ count 재동기화, replay missile origin), 그 수정들은 건드리지 않았음이 검증되었습니다.

### Costs and risks

- 방문자가 `/`와 `/lab/relayhub`를 서로 다른 tab에 열어두면 live subscription이 두 개 동시에 열릴 수 있습니다(각각 `relayhub-java`의 `/api/live/stream`에 자기 자신의 `EventSource`를 엽니다) — 두 개의 독립적인 live view가 존재하는 것의 정상적인 결과로 받아들입니다; relayhub-java의 SSE endpoint는 이 사이트가 capacity를 관리해야 하는 희소 자원이 아닙니다.
- `LiveSignal`의 topology preview는 real node 이름은 보여주지만 real-time pulse 애니메이션은 보여주지 않습니다(Decision 참고) — `/lab/relayhub`와 나란히 비교하는 방문자는 preview가 "덜 live하다"고 느낄 수 있습니다. 받아들임: spec이 명시적으로 "재사용하거나 축약"을 허용하고 있고, homepage preview를 위해 full 애니메이션 엔진의 regression surface를 통째로 복제하는 것은 바로 이번 주에 그 엔진에서 real bug 두 개가 고쳐졌다는 점을 고려하면 위험을 감수할 가치가 없다고 판단했습니다.
- 새로 추가된 다섯 개의 `src/components/ui/` primitive는 아직 새 홈페이지와 header 바깥에서는 어디서도 쓰이지 않습니다 — 기존 페이지들은 후속 visual-hierarchy pass(포기된 게 아니라 "Next" 작업으로 추적됨) 전까지는 손으로 작성된 Tailwind class 문자열을 그대로 유지합니다.

## Alternatives considered

### `LiveTopology`의 공유 내부 로직을 재사용 가능한 engine으로 추출하고, "full" mode와 "compact" mode를 둘 다 거기서 렌더링하기

더 우아하고, 코드 재사용도 더 많습니다. 이번 변경에서는 기각: `live-topology.tsx`는 동작 중이고 최근에 두 번 bug가 고쳐진 파일이며, 새로운 consumer를 위해 그 내부 로직을 refactor하는 것은 homepage 장식 하나의 이득을 위해 production console에 real regression 위험을 지우는 일입니다. 같은 애니메이션의 세 번째 consumer가 등장하면 다시 검토합니다 — 새로운 독립적 consumer 하나만으로는 아직 이 추출을 정당화하지 못합니다.

### `/`는 redirect로 유지하되, `/lab/relayhub` 대신 새로운 통합 페이지를 가리키게 하기

`/profile`/`/lab`의 routing을 전혀 건드리지 않았을 것입니다. 기각: `output: "export"`(ADR-0003) 하에서는 redirect가 여기서 얻는 게 없습니다 — 빠르게 만들 server-side redirect가 애초에 없고, `/`가 자체적으로 보여줄 real 콘텐츠를 갖게 된 이상 이는 crawler/no-JS client에 대한 콘텐츠 가시성을 아무 이득 없이 희생시키는 것입니다.

## Update (2026-09-29): RelayHub activity drill-down을 위해 Radix가 도입되다

이 ADR의 "Costs and risks"는 다섯 개의 `src/components/ui/` primitive(`Button`/`Badge`/`Card`/`Separator`/`Skeleton`)가 "Dialog/Sheet가 필요해지는 나중 phase까지" Radix 없이 유지될 것이라고 예상했습니다. 그 phase가 바로 RelayHub Live activity drill-down입니다(ADR-0004 자체의 2026-09-29 Update 참고 — 같은 날 있었던 우회로도 포함해서: 첫 시도가 빌드됐다가, `relayhub-java`의 진짜 이전 이유로 admin-gate된 endpoint에 의존한다는 게 발견돼서 출시 전에 되돌려졌고, 이후 maintainer가 `relayhub-java` 쪽에서 그 endpoint를 다시 열어서 실제로 이걸 unblock했습니다): `/lab/relayhub`의 Recent Activity table에서 delivery row를 클릭하면 이제 `Sheet`가 열립니다.

- 이 repository의 첫 Radix dependency로 `@radix-ui/react-dialog`를 추가했으며, `src/components/ui/sheet.tsx`(Root/Trigger/Portal/Overlay/Content/Close/Title/Description, 이 사이트의 token으로 재스타일링됨)로 wrapping했습니다 — 처음 다섯 개의 primitive가 사용한 것과 같은 shadcn 스타일의 "primitive를 복사해서 넣되, 전체 library를 설치하지는 않는다" 접근이며, 단지 이번엔 slide-in panel이 실제로 필요로 하는 focus-trap/Escape/aria 연결을 위해 그 아래에 Radix가 있을 뿐입니다.
- 이번 변경에서 다른 어떤 primitive도 Radix dependency를 얻지 않았습니다 — `Button`/`Badge`/`Card`/`Separator`/`Skeleton`은 변경되지 않았습니다. 다음 Radix 기반 추가는(만약 있다면) 같은 방식으로 진행됩니다: 구체적인 페이지가 실제로 필요로 할 때만.

## Update (2026-10-07): `/lab`이 다시 real한 multi-service index가 되다

이 ADR의 Decision은 `/lab`을 "불필요한 한 단계를 없애기" 위해 `/lab/relayhub`로 바로 가는 thin `redirect()`로 만들었는데, 그 파일 자체의 code comment가 이미 정확히 이 번복을 예상하고 있었습니다: *"If a second Live system is ever added, this becomes a real overview page again rather than a redirect."* 그 trigger가 왔습니다 — `cleanbrain-me-infra`의 README("developer.cleanbrain.me subdomain namespace", `relayhub-java` 자체의 ADR-0002를 인용)에 따르면, RelayHub는 language sibling(`relayhub-<lang>`, 예: 미래의 `relayhub-node`)으로 scale out될 계획입니다 — 같은 product와 API contract의 별도로 배포된 instance이지, 다른 product가 아닙니다. maintainer는 RelayHub가 오늘 유일한 real entry로 남아 있는 동안에도 `/lab`이 "이 사이트는 RelayHub monitoring console이다"로 읽히는 걸 멈추길 원했습니다.

- 새 `src/content/live-services.ts`: 작은 registry(`LiveService { slug, name, language, baseUrl, description, status }`) — 이 사이트가 데이터를 보여주는 모든 Live system의 단일 source of truth입니다. 오늘은 entry 하나(`relayhub`, Java, `status: "live"`) — 미래의 sibling은 자기 자신의 slug를 가진 새 entry이지, 이것의 rename이 절대 아닙니다(그래서 기존 `/lab/relayhub` URL이 절대 깨지지 않습니다).
- `src/lib/relayhub/{live-topology,live-observability}.ts`: module-level `RELAYHUB_JAVA_BASE_URL` 상수가 사라졌습니다 — export되는 모든 fetch/stream 함수가 이제 `baseUrl: string` parameter를 받습니다. 이게 real한 일반화입니다: 미래의 sibling은 새 fetch 로직이 아니라 새 registry entry 하나만 필요합니다 — sibling들은 `relayhub-java`가 이미 노출하는 것과 같은 REST/SSE contract를 공유하기 때문입니다. wire shape/type은 변경되지 않았습니다.
- `LiveTopology`/`LiveDashboard`/`ActivityDetailSheet`는 이제 하나의 instance를 하드코딩하는 대신 `service`/`baseUrl` prop을 받습니다; 이들의 RelayHub-java 전용 표시 문자열(`"relayhub-java — Live Monitoring"`, 외부 console link, "Connecting to…" loading text)은 service-driven이 됐습니다. 다이어그램 위의 "RelayHub" hub label은 literal text로 남았습니다 — 그건 product 이름이고, 어떤 language instance에 대해서도 여전히 정확합니다.
- `src/app/lab/[slug]/page.tsx`(새로 추가, `liveServices`에 대한 `generateStaticParams`, `/projects/[slug]`/`/case-studies/[slug]`와 같은 `notFound()` 패턴)가 기존의 손으로 작성된 `src/app/lab/relayhub/page.tsx`를 대체합니다. 기존 instance의 registry slug가 여전히 `"relayhub"`이기 때문에, 이건 정확히 같은 `/lab/relayhub` static file을 생성합니다 — link가 깨지지 않습니다.
- `src/app/lab/page.tsx`는 이제 real한 index page입니다: `LiveServiceCard`들의 grid(새 `src/components/lab/` 폴더, 이 layer가 generic이기 때문에 의도적으로 `relayhub/` 아래에 두지 않음). 각 card는 이름, language, status, 작은 ambient `LivePulse` 애니메이션을 보여줍니다 — 순수하게 장식적인 Tailwind `animate-ping`/`animate-pulse` dot이며, `LiveTopology`의 pulse/explosion engine을 재사용하지 **않고** data-driven도 **아닙니다** — 이 ADR이 이미 `LiveSignal`의 homepage preview에 적용했던 것과 같은 regression-avoidance 논리입니다("Alternatives considered", 원래 decision 참고). `"coming-soon"` entry(아직 없음)는 링크로 나가는 대신 클릭 불가능하게 렌더링됩니다.
- `site-header.tsx`의 "Live Systems" nav 항목은 이제 `/lab`을 가리킵니다(이전엔 `/lab/relayhub`) — 일반화되어야 할 유일한 곳입니다, 주된 global entry point이기 때문입니다. 기존의 다른 모든 직접적인 `/lab/relayhub` 참조(`/contact`의 "RelayHub Live Monitoring" link, `/projects`의 "Open RelayHub Live" CTA, homepage hero button)는 변경되지 않았습니다 — 각각 이미 자기 자신의 link 텍스트에서 명시적으로 RelayHub라고 이름 붙어 있으므로, 거기서 RelayHub detail page로 바로 연결하는 건 여전히 올바릅니다.
- `LiveSignal`(homepage)은 이제 자기 자신의 두 번째 하드코딩된 URL 상수 대신 `liveServices[0].baseUrl`을 읽습니다 — 같은 데이터이지만, 어긋날 수 있는 두 개의 복사본 대신 하나의 source of truth입니다.

이건 이 ADR이 이미 내렸고 명시적으로 다시 검토될 수 있다고 표시해뒀던 바로 그 decision의 연장이지, 새 ADR이 아닙니다.
