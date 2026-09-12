# ADR-0003: Static Export Deployment (nginx, not a Node Server)

- Status: Accepted
- Date: 2026-09-13
- Deciders: cleanbrain.developer

## Context

Every route in this application (`docs/status/current-state.md`'s Phase 1–5 work) is either fully static or statically generated via `generateStaticParams` — there are no API routes, no server-only data fetching, no middleware, and the one interactive feature (the RelayHub Live Lab) is entirely client-side (`MockRelayHubAdapter` runs in the browser; see `docs/architecture/overview.md`). Nothing in this application actually requires a running Node server at request time.

`cleanbrain-me-infra`'s cluster budget (2 vCPU / 4 GB RAM, per that repository's README) is shared across every deployed service. `cleanbrain-me-entrance` already established the lighter-weight pattern for a project with no server-side requirement: build a static bundle, serve it from `nginx:alpine`, rather than running a Node process per request.

## Decision

- Set `output: "export"` in `next.config.ts`. `next build` now emits a static `out/` directory instead of requiring `next start`.
- Serve that directory from `nginx:1.27-alpine` (`Dockerfile`), matching `cleanbrain-me-entrance`'s deployment shape rather than running `next start` in the container.
- `nginx.conf` uses `try_files $uri $uri.html $uri/ =404;`, not `cleanbrain-me-entrance`'s `try_files $uri $uri/ /index.html;` — `next export` emits `<route>.html` files (e.g. `architecture.html`), not `<route>/index.html`, and this site has no client-side router fallback for unmatched paths to hand off to (every real route is pre-rendered; an unmatched path is a genuine 404, served via `error_page 404 /404.html;` using Next's own generated 404 page).
- `/lab` (`src/app/lab/page.tsx`) was changed from a `next/navigation` `redirect()` to a real, thin landing page linking to `/lab/relayhub`. Under static export, `redirect()` only takes effect after client-side hydration (there is no server to issue an HTTP redirect), which would show a crawler or no-JS client a blank/error shell instead of real content — a real page sidesteps that entirely rather than trying to fake a redirect.

## Consequences

### Positive

- No Node process runs in production for this application — a smaller, more predictable resource footprint on the shared 2 vCPU / 4 GB cluster, and one fewer runtime to patch/monitor.
- Deployment shape now matches `cleanbrain-me-entrance`'s precedent, which `cleanbrain-me-infra` already knows how to operate (GHCR image, `ci-deployer` RBAC, HTTPRoute against the shared Gateway).
- Verified end to end before committing: built the actual Docker image, ran the container, and confirmed via `curl` that every route 2xx's, an unmatched path correctly 404s with the custom page, and static assets carry long-cache headers — plus a headless-browser pass confirming the RelayHub Lab is still fully interactive when served this way.

### Costs and risks

- `HttpRelayHubAdapter` (ADR-0002), if ever activated, would call a real API directly from the browser (no server-side proxy exists to route through) — that real API would need to support CORS from `developer.cleanbrain.me`. Not a blocker today since `HttpRelayHubAdapter` is not active in production, but a constraint on any future real backend.
- Any future requirement for genuine server-side rendering, API routes, or middleware would require reverting this decision (dropping `output: "export"` and moving back to a Node runtime container) — a real, if currently unlikely, future cost.
- Every route must remain statically generatable. A future feature that needs per-request server logic (not just client-side interactivity) would need a new ADR before it could be added.

## Alternatives considered

### Keep `next start` in a Node container (the Phase 1–4 assumption)

This is what `docs/architecture/overview.md`'s "Deployment target" section originally described. Works, but runs an idle Node server for a site that does no server-side work at request time — a heavier footprint than the actual requirement justifies, and inconsistent with `cleanbrain-me-entrance`'s established lighter-weight precedent for the same kind of workload. Rejected once the static-export path was confirmed to work end to end.
