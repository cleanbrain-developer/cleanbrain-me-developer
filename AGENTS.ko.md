> 이 문서는 [`AGENTS.md`](AGENTS.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다. Agent bootstrap은 이 번역본이 아니라 영어 원본을 읽습니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

이 버전은 breaking change를 포함하고 있습니다 — API, convention, file structure가 당신의 training data와 다를 수 있습니다. 코드를 작성하기 전에 `node_modules/next/dist/docs/`(이 파일이 위치한 디렉터리 기준으로 resolve됨; monorepo에서는 repo root에서 `next` package가 보이지 않을 수 있음)에 있는 관련 가이드를 읽으세요. Deprecation notice에 유의하세요.

이 블록은 `next dev`에 의해 작성되고 다시 추가됩니다 — `node_modules/next/dist/server/lib/generate-agent-files.js`에서 확인하세요. diff에서 이를 제거해도 커밋되지 않은 변경이 다시 생성될 뿐입니다. 이를 작업 내용과 함께 커밋해야 tree가 깨끗하게 유지됩니다.

<!-- END:nextjs-agent-rules -->

# Codex Project Adapter

이 파일은 Codex-compatible agent를 위한 repository entry point입니다(위의 Next.js가 관리하는 블록 아래에 위치하며, `next dev`가 이를 다시 쓸 수 있습니다 — 그 블록을 제거하지 말고, 그 아래에만 추가하세요). 여기에 프로젝트 정책이나 설계를 중복해서 두지 마세요. 공유되는 source of truth는 아래에 나열되어 있습니다.

## Context bootstrap

먼저 `PROJECT.yaml`을 읽고, 그다음 `docs/architecture/agent-context-model.md`에 정의된 bootstrap 순서와 충돌 처리 규칙을 따르세요. 이 adapter는 그 순서를 다시 서술하지 않습니다 — 이 목록과 그 문서가 서로 다르면 `agent-context-model.md`가 우선합니다.

## Working contract

- 계획을 세우거나 무언가를 변경하기 전에 repository 근거를 확인한다.
- 요청을 충족하는 가장 작고 일관된 변경을 우선한다.
- architecture를 조용히 바꾸지 않는다. 중대한 결정은 ADR에 기록한다.
- public RelayHub Live Lab에 임의의 URL, header, script, credential 입력을 절대 구현하지 않는다.
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure 변경은 이 repository가 아니라 `cleanbrain-me-infra`에 속한다 — 대신 `docs/infra-required-changes.md`에 요구사항을 기록한다.
- 완료를 주장하기 전에 가능한 검증을 수행하고, 검증된 결과와 검증되지 않은 항목을 구분한다.
- durable한 결정과 working-state 변경 사항은 같은 변경 안에서 올바른 source of truth에 저장한다.
- conversation history나 이 adapter를 장기적인 설계 소스로 취급하지 않는다.

현재 phase와 다음 작업에 대한 source of truth로는 항상 `docs/status/current-state.md`를 사용하세요.
