> 이 문서는 [`infra-required-changes.md`](infra-required-changes.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# Infra-Required Changes

이 문서는 이 repository가 스스로 구현할 수 없거나 구현해서는 안 되는 infrastructure 요구사항을 기록합니다(`.specify/memory/constitution.md`의 "Separated boundaries" 참고). Kubernetes, DNS, TLS, Gateway, CI/CD-infrastructure 변경은 `cleanbrain-me-infra`가 소유합니다. 이 파일의 내용은 자동으로 적용되지 않습니다 — 각 항목은 해당 repository에서 사람이 검토하는 변경이 필요합니다.

## Pending

- 이 사이트가 동작하는 CI/CD pipeline과 함께 live 상태이므로, `cleanbrain-me-entrance`의 `src/config/services.ts`에 실제(`planned`가 아닌) `developer` entry가 필요하다 — 여기와 해당 repository 자체의 `docs/status/current-state.md`의 "Next" 항목에서 추적 중이다.

## Resolved

- `cleanbrain-me-infra`에 declarative manifest가 작성되고 커밋됨: `kubernetes/namespaces/cleanbrain-me-developer.yaml`, `kubernetes/apps/developer/{deployment,service,rbac,httproute}.yaml` — namespace `cleanbrain-me-developer`, `Deployment`/`Service`는 (`cleanbrain-me-entrance`와 일치하는) `web`으로 명명, 이 namespace로만 범위가 한정된 전용 최소권한 `ci-deployer` Role/RoleBinding, 그리고 cross-namespace `parentRef`를 통해 공유되는 `cleanbrain-me-gateway`에 연결된 hostname `developer.cleanbrain.me`용 `HTTPRoute`(새로운 Gateway나 ClusterIssuer 없음).
- DNS: `developer.cleanbrain.me`는 `cleanbrain.me`로의 CNAME으로 resolve된다(2026-09-13 확인) — 별도의 A record는 필요하지 않았다.
- Gateway listener: `developer-https`가 문서화된 `kubectl patch` 방식을 통해 공유되는 `cleanbrain-me-gateway`에 추가되었다(2026-09-13). `openssl s_client`로 `developer.cleanbrain.me:443`에 접속해 real Let's Encrypt certificate를 확인했다.
- Cluster-admin bootstrap apply(`namespace` → `rbac` → `deployment` → `service` → `httproute`)는 maintainer가 서버에서 직접 수행했다(2026-09-13). 확인됨: `pod/web`이 `Running 1/1`, `httproute/developer`가 `Accepted: True`/`ResolvedRefs: True`, `https://developer.cleanbrain.me/`(및 `/lab/relayhub`, `/projects/relayhub`)가 `200`을 반환, 매치되지 않는 path는 `404`를 반환, live headless-browser pass가 콘솔 오류 없이 합성 RelayHub event를 생성함. **`https://developer.cleanbrain.me`는 live 상태다.**
- GHCR package(`ghcr.io/cleanbrain-developer/cleanbrain-me-developer`)는 인증 없이 `docker manifest inspect`가 성공하는 것으로 public임을 확인했다 — `imagePullSecrets`가 필요 없다.
- 이 repo에 `HETZNER_SSH_*` GitHub Actions secret이 설정됨(`english-core-speaking`의 기존 CI SSH keypair 재사용; `ssh-keyscan`의 출력을 신뢰하기 전에 host key fingerprint를 서버에서 직접 대조 확인함), CI ServiceAccount token/kubeconfig context가 deploy host에 병합됨(2026-09-13). 확인됨: `kubectl auth whoami` → `system:serviceaccount:cleanbrain-me-developer:ci-deployer`; `can-i patch deployment/web` → `yes`; `can-i get secrets` → `no`.
- `ENABLE_PRODUCTION_DEPLOY=true`가 설정되었고, 실제로 트리거된 workflow run(`test` → `build-and-push` → `deploy`)이 end to end로 성공했다(2026-09-13) — 실행 중인 Pod의 image가 `:latest`가 아니라 CI가 방금 push한 immutable commit-SHA tag임을 확인하여 검증했다.
