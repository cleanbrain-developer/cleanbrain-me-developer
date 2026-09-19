> 이 문서는 [`goals.md`](goals.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Goals

## V1 goals

1. 처음 방문한 사람이 30–60초 이내에 cleanbrain.developer가 distributed-systems, integration, production-troubleshooting 경험을 가진 backend engineer라는 것을 이해한다 — 평범한 full-stack 포트폴리오가 아니다.
2. 홈페이지는 "Open RelayHub Lab", "Explore Projects", "View Case Studies" 중 최소 두 개를 즉각적인 CTA로 노출한다.
3. `/lab/relayhub`는 방문자가 미리 정의된 시나리오(normal, target 500, timeout, validation error) 아래에서 합성 이벤트를 생성하고, 그것이 pipeline stage를 거쳐 이동하는 것을 관찰할 수 있게 한다 — failure 시나리오의 경우 retry → DLQ → replay를 포함한다.
4. 모든 프로젝트와 케이스 스터디는 동일한 근거 중심 구조(problem → architecture → decisions → failure handling → observability → result → lessons learned)를 따르며, 단순한 기술 목록이 되지 않는다.
5. public Live Lab은 절대 임의의 URL, header, script, credential 입력을 받지 않으며, real한 회사, 고객, production 데이터를 다루지 않는다 — 합성 데이터만 사용한다(`docs/product/scope.md` 참고).
6. 콘텐츠(프로필, 경력, 프로젝트, 케이스 스터디)는 `src/content/` 아래에서 config/content 기반이며, presentation component에 하드코딩되지 않는다.
7. `cleanbrain-me-infra` cluster의 2 vCPU / 4 GB RAM 제약(현재 resource budget은 해당 repository의 README 참고)에 맞는, 가벼운 container가 서빙할 수 있는 Next.js 앱으로 출시한다.

## Success criteria

이전 conversation 없이 `AGENTS.md`에서만 시작하는 새로운 agent session은 다음 질문에 정확히 답할 수 있어야 합니다.

- 이 프로젝트는 무엇이며, 의도적으로 하지 않는 것은 무엇인가?
- 왜 존재하는가?
- 핵심 원칙과 architecture는 무엇인가(RelayHub Lab의 adapter pattern 포함)?
- 무엇이 완료되었으며, 현재 phase는 무엇인가?
- 다음에 무엇을 해야 하는가?

모든 답은 가정된 context가 아니라 repository 경로(이 문서, `docs/architecture/`, `docs/status/current-state.md`, 또는 source tree)로 추적 가능해야 합니다.

## Long-term direction

mock 기반 V1이 배포되어 안정화된 이후, 가능한 향후 확장 방향입니다.

1. real RelayHub demo API를 호출하는 `HttpRelayHubAdapter`로 live metrics, live trace timeline, real DLQ replay를 구현.
2. 방문자가 실제로 도달하는 section(project detail, Live Lab, case studies, resume)에 대한 real analytics.
3. 실제로 만들어지고 게시 준비가 되는 대로 추가되는 프로젝트와 케이스 스터디.

이 순서는 commitment가 아니라 방향입니다. 실제 요구사항이 생기기 전에 이를 향해 미리 구축하지 마세요(`docs/product/scope.md`의 "Scope rule" 참고).
