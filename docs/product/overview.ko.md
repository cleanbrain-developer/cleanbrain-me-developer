> 이 문서는 [`overview.md`](overview.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Product Overview

## Product

developer.cleanbrain.me는 cleanbrain.developer의 public developer 사이트로, 하나의 애플리케이션에 세 가지 역할을 결합합니다.

1. **Developer Profile** — 경력 요약, 기술 스택, resume, 연락처.
2. **Engineering Portfolio** — feature 목록이 아니라 problem → architecture → decisions → failure handling → observability → result 형태로 작성된 프로젝트와 production 케이스 스터디.
3. **Live Engineering Lab** — interactive하고 안전하며 합성 데이터만 사용하는 demo(초기에는 RelayHub)로, 방문자가 이벤트를 생성하고 이것이 ingestion, validation, transformation, delivery, retry, DLQ/replay를 거쳐 이동하는 것을 지켜볼 수 있습니다.

## Problem

resume 스타일의 포트폴리오 페이지는 글로 backend와 distributed-systems 경험을 주장합니다. 이 페이지를 방문하는 recruiter나 engineer는 그 주장을 빠르게 검증할 방법이 없으며, 실제 경험의 깊이와 무관하게 이 페이지는 수백 개의 다른 포트폴리오 사이트와 똑같아 보입니다.

## Product thesis

> Evidence over claims: "저는 distributed systems를 이해합니다"라고 쓰는 대신, 이 사이트는 방문자가 합성 이벤트를 트리거하고 retry, DLQ, replay 동작이 일어나는 것을 지켜볼 수 있게 합니다.

이 사이트는 Notion 문서를 복제한 것도, 뒤에 real한 정보가 없는 dashboard mockup도 아닙니다. Live Lab은 real한 interactive state machine 동작입니다(초기에는 mock adapter가 뒷받침하고, 나중에는 real RelayHub API가 뒷받침) — 절대 static screenshot이나 정해진 애니메이션이 아닙니다.

## Users

- **Primary**: cleanbrain.developer를 평가하는 backend engineering hiring manager, recruiter, technical interviewer로, `/`에 도착한 지 30–60초 이내에 "이 사람은 production, integration, observability 경험을 가진 backend engineer"라는 것을 이해해야 한다.
- **Secondary**: 기술적 흥미로 사이트를 둘러보는 다른 software engineer로, `/architecture`, `/case-studies`, `/lab/relayhub`로 더 깊이 들어갈 수 있다.

## Relationship to other repositories

- `english-core-speaking`과 `relayhub-java`(그리고 `relayhub-demo-systems`)는 이 사이트가 `/projects` 아래에서 *설명하고 link하는* real하고 독립적으로 배포된 서비스다. 이 사이트는 그들의 runtime을 embed하거나 의존하지 않는다.
- `cleanbrain-me-infra`는 `cleanbrain-me-developer` namespace convention 아래 이 서비스의 production Kubernetes manifest를 소유한다. 이 repository는 오직 애플리케이션 source, Dockerfile, CI만 소유한다.
- `cleanbrain-me-entrance`(`cleanbrain.me`)는 root-domain 서비스 디렉터리다. 이 프로젝트가 live되면, `cleanbrain-me-entrance`는 여기를 가리키는 real한(placeholder가 아닌) `developer.cleanbrain.me` entry를 추가한다.

## Open items

- RelayHub Live Lab이 언젠가 real한 `relayhub-java` API(`HttpRelayHubAdapter`)를 호출할지는 이후 phase의 문제다(`docs/product/scope.md`의 "Out of scope"와 `docs/architecture/overview.md`의 "Adapter pattern" 참고). V1은 `MockRelayHubAdapter`만 사용한다.
