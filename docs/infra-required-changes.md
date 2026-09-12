# Infra-Required Changes

This document records infrastructure requirements this repository cannot and must not implement itself (see `.ai/constitution/engineering-principles.md`, "Separated boundaries"). Kubernetes, DNS, TLS, Gateway, and CI/CD-infrastructure changes are owned by `cleanbrain-me-infra`. Nothing in this file is applied automatically — each item needs a human-reviewed change in that repository.

## Pending

- Create namespace `cleanbrain-me-developer` (per `cleanbrain-me-infra`'s naming convention) with a `Deployment`/`Service`/`HTTPRoute` for this app (`Deployment`/`Service` named `web`, matching `cleanbrain-me-entrance`), `HTTPRoute` hostname `developer.cleanbrain.me` attached to the existing shared `cleanbrain-me-gateway` via cross-namespace `parentRef` — no new Gateway or ClusterIssuer.
- Public GHCR image (`ghcr.io/cleanbrain-developer/cleanbrain-me-developer`) expected, matching `cleanbrain-me-entrance`'s and `english-core-speaking`'s pattern — confirm no `imagePullSecrets` needed once the package visibility is set (public, per `cleanbrain-me-infra`'s "GHCR image pull authentication" note).
- A dedicated, least-privilege CI `ci-deployer` ServiceAccount/RBAC scoped to the `cleanbrain-me-developer` namespace only — do not widen `english-core-speaking`'s, `cleanbrain-me-entrance`'s, or `relayhub-java`'s existing identities.
- **DNS is a real blocker here, confirmed by reading `cleanbrain-me-infra`'s README as of 2026-09-13, not just a "confirm whether" item**: only `relayhub-java.developer.cleanbrain.me` exists under the `developer.cleanbrain.me` subdomain namespace today (added for `relayhub-java`, per that repo's ADR-0002) — the bare `developer.cleanbrain.me` hostname this application actually needs has **no DNS record and no Gateway listener at all** yet. A wildcard on `*.developer.cleanbrain.me` (if one gets added for future `relayhub-<lang>` siblings) would **not** cover the bare `developer.cleanbrain.me` host itself (a DNS wildcard requires a label in the `*` position) — a dedicated A record for `developer.cleanbrain.me` is needed regardless.
- A new Gateway HTTPS listener for hostname `developer.cleanbrain.me` (cert-manager Gateway Shim will auto-issue the certificate once the listener exists, per the pattern already used for `cleanbrain.me`, `crm-discount.kioti.cleanbrain.me`, and `relayhub-java.developer.cleanbrain.me` — see that repo's README "Adding a new hostname to the shared Gateway").
- Once live, `cleanbrain-me-entrance`'s `src/config/services.ts` needs a real (non-`planned`) `developer` entry — tracked here and in that repository's own `docs/status/current-state.md` "Next" item.

## Resolved

(none yet)
