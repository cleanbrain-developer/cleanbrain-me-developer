> 이 문서는 [`agent-behavior.md`](agent-behavior.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Agent Behavior

이 문서는 이 repository에서 작업하는 coding agent들이 공유하는 behavior contract를 정의합니다.

## 작업 전

- `docs/architecture/agent-context-model.md`에 정의된 순서대로 persistent context를 로드한다.
- 현재 요청, `docs/status/current-state.md`, 관련 파일들을 확인한다.
- 기존 문서와 구현에서 근거를 찾고, 영향을 받는 범위를 파악한다.
- 변경 작업의 경우, 구현에 앞서 적절한 규모의 계획과 검증 전략을 준비한다.

## 작업 중

- 사용자의 요청과 이미 합의된 결정 범위 안에서 작업한다.
- 기존 변경 사항은 사용자 소유로 간주하고, 관련 없는 작업을 덮어쓰지 않는다.
- 중대한 가정과 architecture 변경 사항(예: RelayHub Lab에 실제 backend를 도입하는 것, CMS 추가, deployment target 변경 등)을 명시적으로 드러낸다.
- 작업 내용이 그렇게 요구하는 것처럼 보이더라도, public Live Lab에 임의의 URL, header, script, credential 입력을 절대 구현하지 않는다 — 대신 이를 flag한다 (`.ai/constitution/engineering-principles.md`의 "Demo safety is non-negotiable" 참고).
- 새로운 규칙은 올바른 source of truth 한 곳에만 기록한다 — `.ai/constitution/`, `docs/`, agent adapter들에 중복해서 두지 않는다.

## 완료 전

- 관련 검증(lint, typecheck, build, test)을 실행하거나, 실행할 수 없었던 이유를 밝힌다.
- 최종 변경 사항을 요구사항, `docs/architecture/`, 문서화 책임과 대조하여 검토한다.
- 완료된 작업, 남아 있는 위험, 미해결 결정을 구분한다.
- 다음 세션이 상태 변화를 알아야 할 경우 `docs/status/current-state.md`를 업데이트한다.

완료를 주장하는 것과 검증을 보여주는 것은 다르다. 검증 근거 없이 성공을 주장하지 않는다.
