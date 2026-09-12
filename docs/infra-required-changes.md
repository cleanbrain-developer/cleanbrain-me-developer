# Infra-Required Changes

This document records infrastructure requirements this repository cannot and must not implement itself (see `.ai/constitution/engineering-principles.md`, "Separated boundaries"). Kubernetes, DNS, TLS, Gateway, and CI/CD-infrastructure changes are owned by `cleanbrain-me-infra`. Nothing in this file is applied automatically — each item needs a human-reviewed change in that repository.

## Pending

- **DNS is a real blocker here, confirmed by reading `cleanbrain-me-infra`'s README as of 2026-09-13, not just a "confirm whether" item**: only `relayhub-java.developer.cleanbrain.me` exists under the `developer.cleanbrain.me` subdomain namespace today (added for `relayhub-java`, per that repo's ADR-0002) — the bare `developer.cleanbrain.me` hostname this application actually needs has **no DNS record and no Gateway listener at all** yet. A wildcard on `*.developer.cleanbrain.me` (if one gets added for future `relayhub-<lang>` siblings) would **not** cover the bare `developer.cleanbrain.me` host itself (a DNS wildcard requires a label in the `*` position) — a dedicated A record for `developer.cleanbrain.me` is needed regardless.
- A new Gateway HTTPS listener for hostname `developer.cleanbrain.me` (cert-manager Gateway Shim will auto-issue the certificate once the listener exists, per the pattern already used for `cleanbrain.me`, `crm-discount.kioti.cleanbrain.me`, and `relayhub-java.developer.cleanbrain.me` — see that repo's README "Adding a new hostname to the shared Gateway"). Manifests below cannot resolve or serve HTTPS without this and the DNS record above.
- Cluster-admin bootstrap apply, in order: `namespace` → `rbac` → `deployment` → `service` → `httproute` (the manifests below already exist and are committed; nothing has been `kubectl apply`'d to the live cluster yet).
- Confirm the GHCR package (`ghcr.io/cleanbrain-developer/cleanbrain-me-developer`) is public once CI has pushed at least once — no `imagePullSecrets` needed if so, matching `cleanbrain-me-entrance`'s and `english-core-speaking`'s pattern.
- Set the `HETZNER_SSH_*` GitHub Actions secrets on the `cleanbrain-me-developer` repo (reusing the existing SSH keypair/deploy account) and flip `ENABLE_PRODUCTION_DEPLOY=true` once the Deployment exists, to verify the CI pipeline end to end.
- Once live, `cleanbrain-me-entrance`'s `src/config/services.ts` needs a real (non-`planned`) `developer` entry — tracked here and in that repository's own `docs/status/current-state.md` "Next" item.

## Resolved

- Declarative manifests drafted and committed in `cleanbrain-me-infra`: `kubernetes/namespaces/cleanbrain-me-developer.yaml`, `kubernetes/apps/developer/{deployment,service,rbac,httproute}.yaml` — namespace `cleanbrain-me-developer`, `Deployment`/`Service` named `web` (matching `cleanbrain-me-entrance`), a dedicated least-privilege `ci-deployer` Role/RoleBinding scoped to this namespace only, and an `HTTPRoute` for hostname `developer.cleanbrain.me` attached to the shared `cleanbrain-me-gateway` via cross-namespace `parentRef` (no new Gateway or ClusterIssuer). Not yet applied — see "Pending" above.
