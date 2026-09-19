# Infra-Required Changes

This document records infrastructure requirements this repository cannot and must not implement itself (see `.specify/memory/constitution.md`, "Separated boundaries"). Kubernetes, DNS, TLS, Gateway, and CI/CD-infrastructure changes are owned by `cleanbrain-me-infra`. Nothing in this file is applied automatically — each item needs a human-reviewed change in that repository.

## Pending

- `cleanbrain-me-entrance`'s `src/config/services.ts` needs a real (non-`planned`) `developer` entry now that this site is live with a working CI/CD pipeline — tracked here and in that repository's own `docs/status/current-state.md` "Next" item.

## Resolved

- Declarative manifests drafted and committed in `cleanbrain-me-infra`: `kubernetes/namespaces/cleanbrain-me-developer.yaml`, `kubernetes/apps/developer/{deployment,service,rbac,httproute}.yaml` — namespace `cleanbrain-me-developer`, `Deployment`/`Service` named `web` (matching `cleanbrain-me-entrance`), a dedicated least-privilege `ci-deployer` Role/RoleBinding scoped to this namespace only, and an `HTTPRoute` for hostname `developer.cleanbrain.me` attached to the shared `cleanbrain-me-gateway` via cross-namespace `parentRef` (no new Gateway or ClusterIssuer).
- DNS: `developer.cleanbrain.me` resolves via a CNAME to `cleanbrain.me` (confirmed 2026-09-13) — no separate A record was needed.
- Gateway listener: `developer-https` was added to the shared `cleanbrain-me-gateway` via the documented `kubectl patch` mechanism (2026-09-13). `openssl s_client` against `developer.cleanbrain.me:443` confirmed a real Let's Encrypt certificate.
- Cluster-admin bootstrap apply (`namespace` → `rbac` → `deployment` → `service` → `httproute`) was performed directly on the server by the maintainer (2026-09-13). Verified: `pod/web` `Running 1/1`, `httproute/developer` `Accepted: True`/`ResolvedRefs: True`, `https://developer.cleanbrain.me/` (and `/lab/relayhub`, `/projects/relayhub`) return `200`, an unmatched path returns `404`, and a live headless-browser pass generated a synthetic RelayHub event with no console errors. **`https://developer.cleanbrain.me` is live.**
- GHCR package (`ghcr.io/cleanbrain-developer/cleanbrain-me-developer`) confirmed public via `docker manifest inspect` succeeding with no authentication — no `imagePullSecrets` needed.
- `HETZNER_SSH_*` GitHub Actions secrets set on this repo (reusing `english-core-speaking`'s existing CI SSH keypair; host key fingerprint cross-checked directly on the server before trusting `ssh-keyscan`'s output), and the CI ServiceAccount token/kubeconfig context merged on the deploy host (2026-09-13). Verified: `kubectl auth whoami` → `system:serviceaccount:cleanbrain-me-developer:ci-deployer`; `can-i patch deployment/web` → `yes`; `can-i get secrets` → `no`.
- `ENABLE_PRODUCTION_DEPLOY=true` set and a real triggered workflow run (`test` → `build-and-push` → `deploy`) succeeded end to end (2026-09-13) — confirmed by the running Pod's image being the immutable commit-SHA tag CI just pushed, not `:latest`.
