> 이 문서는 [`AGENTS.md`](AGENTS.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다. Agent bootstrap은 이 번역본이 아니라 영어 원본을 읽습니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

이 버전은 breaking change를 포함하고 있습니다 — API, convention, file structure가 당신의 training data와 다를 수 있습니다. 코드를 작성하기 전에 `node_modules/next/dist/docs/`(이 파일이 위치한 디렉터리 기준으로 resolve됨; monorepo에서는 repo root에서 `next` package가 보이지 않을 수 있음)에 있는 관련 가이드를 읽으세요. Deprecation notice에 유의하세요.

이 블록은 `next dev`에 의해 작성되고 다시 추가됩니다 — `node_modules/next/dist/server/lib/generate-agent-files.js`에서 확인하세요. diff에서 이를 제거해도 커밋되지 않은 변경이 다시 생성될 뿐입니다. 이를 작업 내용과 함께 커밋해야 tree가 깨끗하게 유지됩니다.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

이 파일은 이 repository에서 작업하는 모든 coding agent — Claude Code, Codex, 또는 `AGENTS.md`를 읽는 다른 도구 — 를 위한 단일하고 agent-agnostic한 entry point입니다(위의 Next.js가 관리하는 블록 아래에 위치하며, `next dev`가 이를 다시 쓸 수 있습니다 — 그 블록을 제거하지 말고, 그 아래에만 추가하세요). 이 파일은 product, architecture, 원칙의 source of truth가 아니라 그것들로 안내하고 모든 agent가 이 repository에서 따르는 behavioral contract를 명시합니다. 이 repository의 유일한 adapter입니다 — 별도의 `CLAUDE.md`는 없습니다(`agent-dev-starter`의 `ADR-0011`; Claude Code는 v2.1.277(2026-09-18)부터 `AGENTS.md`를 네이티브로 읽습니다).

## Context bootstrap

먼저 `PROJECT.yaml`을 읽고, 그다음 `docs/architecture/agent-context-model.md`에 정의된 bootstrap 순서와 충돌 처리 규칙을 따르세요. 이 섹션은 그 순서를 다시 서술하지 않습니다 — 이 섹션과 그 문서가 서로 다르면 `agent-context-model.md`가 우선합니다.

## Working contract

### 작업 전

- `agent-context-model.md`가 정의한 순서대로 persistent context를 로드한다.
- 현재 요청, `docs/status/current-state.md`, 관련 파일들을 확인한다.
- 변경을 제안하기 전에 기존 문서와 구현에서 근거를 찾는다.
- 변경 작업의 경우, 구현에 앞서 적절한 규모의 계획과 검증 전략을 준비한다.

### 작업 중

- 사용자의 요청과 이미 합의된 결정 범위 안에서 작업하며, 기존 변경 사항은 사용자 소유로 간주하고 관련 없는 작업을 덮어쓰지 않는다.
- 중대한 가정과 architecture 변경 사항(예: RelayHub Lab에 실제 backend를 도입하는 것, CMS 추가, deployment target 변경 등)을 조용히 결정하지 말고 명시적으로 드러낸다.
- 작업 내용이 그렇게 요구하는 것처럼 보이더라도, public RelayHub Live Monitoring 통합에 임의의 URL, header, script, credential 입력을 절대 구현하지 않는다 — 대신 이를 flag한다(`.specify/memory/constitution.md`의 "The RelayHub Live Monitoring integration stays real, read-only, and narrowly scoped" 참고).
- Kubernetes/DNS/TLS/Gateway/CI-infrastructure 변경은 이 repository가 아니라 `cleanbrain-me-infra`에 속한다 — 여기서 직접 구현하지 말고 `docs/infra-required-changes.md`에 요구사항을 기록한다.
- 새로운 규칙은 올바른 source of truth 한 곳에만 기록한다 — 이 파일에는 절대 기록하지 않는다.

### 완료 전

- 관련 검증(lint, typecheck, build, test)을 실행하거나, 실행할 수 없었던 이유를 밝힌다. 자동화된 check가 green인 것과 실행 중인 real system에 대한 직접 검증을 구분한다.
- 최종 변경 사항을 요구사항, `docs/architecture/`, 문서화 책임과 대조하여 검토한다.
- 완료된 작업, 남아 있는 위험, 미해결 결정을 구분한다.
- 다음 세션이 상태 변화를 알아야 할 경우 `docs/status/current-state.md`를 업데이트한다.
- 이 변경이 `.ko.md` 번역본이 있는 문서를 수정했다면, 같은 변경 안에서 번역본도 업데이트한다 — 낡은 번역은 defect이며, 나중에 처리할 follow-up이 아니다.

완료를 주장하는 것과 검증을 보여주는 것은 다르다. 검증 근거 없이 성공을 주장하지 않는다.

## Conflict handling

- 사용자 요청은 작업 목표를 정의하지만, 합의된 architecture를 조용히 무시하지는 않는다(예: public Live Monitoring 통합에 real network call을 구현하거나 임의의 URL 입력을 추가하는 것을 정당화하지 않는다).
- 구체적인 accepted ADR은 일반적인 architecture 설명보다 우선한다.
- `current-state.md`는 원칙이나 설계를 재정의하지 않는다.
- 미해결 충돌은 가정으로 감추지 말고 보고한다.

현재 phase와 다음 작업에 대한 source of truth로는 `docs/status/current-state.md`를 사용하세요.
