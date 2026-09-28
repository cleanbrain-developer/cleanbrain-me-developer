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
