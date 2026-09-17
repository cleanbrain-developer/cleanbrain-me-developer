> 이 문서는 [`CLAUDE.md`](CLAUDE.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다. Agent bootstrap은 이 번역본이 아니라 영어 원본을 읽습니다.

# Claude Code Project Adapter

이 파일은 Claude Code를 위한 repository entry adapter입니다. 공유 정책이나 프로젝트 설계에 대한 source of truth가 아니며, Claude Code를 아래의 repository context로 안내하는 역할만 합니다.

## Required context

먼저 `PROJECT.yaml`을 읽고, 그다음 `docs/architecture/agent-context-model.md`에 정의된 bootstrap 순서와 충돌 처리 규칙을 따르세요. 이 adapter는 그 순서를 다시 서술하지 않습니다 — 이 목록과 그 문서가 서로 다르면 `agent-context-model.md`가 우선합니다.

## Working contract

- 기존 근거를 확인하고 변경 계획을 준비한다.
- 가장 작고 일관된 변경을 구현하고, 검증하고, 최종 diff를 review한다.
- architectural decision이나 durable한 상태를 conversation history에만 남겨두지 않는다.
- 공유 규칙은 이 adapter가 아니라 적절한 constitution이나 documentation source에 추가한다.
- 미해결 충돌과 미결 결정은 가정으로 조용히 해결하지 말고 명시적으로 드러낸다.
- public RelayHub Live Lab에 임의의 URL, header, script, credential 입력을 절대 구현하지 않는다 — `.ai/constitution/engineering-principles.md`의 "Demo safety is non-negotiable" 참고.
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure 변경은 이 repository가 아니라 `cleanbrain-me-infra`에 속한다 — 여기서 직접 구현하지 말고 `docs/infra-required-changes.md`에 요구사항을 기록한다.

현재 phase와 다음 작업에 대한 source of truth로는 `docs/status/current-state.md`를 사용하세요.

Codex-compatible adapter는 Next.js가 관리하는 블록 아래의 `AGENTS.md`도 참고하세요. 두 adapter 모두 위와 동일한 공유 source of truth로 연결됩니다.
