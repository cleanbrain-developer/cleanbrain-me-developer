# Infra-Required Changes

This document records infrastructure requirements this repository cannot and must not implement itself (see `.ai/constitution/engineering-principles.md`, "Separated boundaries"). Kubernetes, DNS, TLS, Gateway, and CI/CD-infrastructure changes are owned by `cleanbrain-me-infra`. Nothing in this file is applied automatically — each item needs a human-reviewed change in that repository.

## Pending

- Create namespace `cleanbrain-me-developer` (per `cleanbrain-me-infra`'s naming convention) with a `Deployment`/`Service`/`HTTPRoute` for this app, `HTTPRoute` attached to the existing shared `cleanbrain-me-gateway` via cross-namespace `parentRef` — no new Gateway or ClusterIssuer.
- Public GHCR image expected (matching `cleanbrain-me-entrance`'s and `english-core-speaking`'s pattern) — confirm no `imagePullSecrets` needed once the package visibility is set.
- A dedicated, least-privilege CI `ci-deployer` ServiceAccount/RBAC scoped to the `cleanbrain-me-developer` namespace only — do not widen `english-core-speaking`'s or `cleanbrain-me-entrance`'s existing identities.
- DNS: confirm whether a `developer.cleanbrain.me` record already exists or needs to be added (mirrors the check `cleanbrain-me-entrance` did for the apex record).
- Once live, `cleanbrain-me-entrance`'s `src/config/services.ts` needs a real (non-`planned`) `developer` entry — tracked here and in that repository's own `docs/status/current-state.md` "Next" item.

## Resolved

(none yet)
