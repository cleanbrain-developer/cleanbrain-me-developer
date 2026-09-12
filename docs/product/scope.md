# Scope

## V1 in scope (P0)

- App shell, navigation, layout, dark-first theme, common components.
- Homepage: hero, engineering focus, featured projects, Live Lab preview, selected case studies, architecture/platform snapshot, resume/contact.
- `/projects` and `/projects/relayhub`, `/projects/english-core-speaking` (route and content schema; content can start thin, but no fabricated results).
- `/lab/relayhub`: Event Generator, Live Pipeline, Metrics (explicitly labeled synthetic/demo), Recent Events, Event Detail, DLQ + Replay — all backed by `MockRelayHubAdapter`.
- At least one real `/case-studies/[slug]` entry, company/customer information abstracted away.
- Responsive layout (desktop, tablet, mobile) and keyboard/accessibility support for all of the above.

## V1 out of scope

- Any Kubernetes, K3s, DNS, TLS/certificate, Gateway, Cloudflare, or CI/CD *infrastructure* change — this repository owns application source, Dockerfile, and CI workflow only. Anything that looks like an infra requirement is recorded in `docs/infra-required-changes.md`, never implemented here directly.
- A real RelayHub backend call in production — `HttpRelayHubAdapter` is implemented (ADR-0002) but not active; `MockRelayHubAdapter` is the only adapter actually used (see `docs/architecture/overview.md`, "Adapter pattern").
- A CMS, a global state-management library, authentication, or a database.
- Arbitrary URL input, arbitrary header input, arbitrary script/code execution, secret/credential input, or any structure that could enable SSRF from the public Live Lab — see `.ai/constitution/engineering-principles.md`, "Demo safety is non-negotiable".
- Real company names, real customer data, real order/ticket IDs, real internal system IDs, or any production credential, anywhere in content or code.
- `/experience`, `/architecture`, `/resume`, `/contact`, and full English Core Speaking content are P1 — routable and content-schema-ready in V1, but not required to be feature-complete.

## Scope rule

Consider out-of-scope items only enough to avoid blocking future extension (e.g. the `RelayHubAdapter` interface exists so `HttpRelayHubAdapter` can be added later without a rewrite). Do not add placeholder screens, unused config options, or speculative abstractions ahead of a real requirement.

## Open decisions

- Exact routing depth under `/case-studies` and `/projects` beyond the P0 set (init prompt §5 allows a more concise URL structure as long as the Profile / Projects / Engineering Lab / Case Studies / Architecture information structure is preserved).
- Whether/when `NEXT_PUBLIC_RELAYHUB_ADAPTER=http` is ever actually turned on against a real deployed API, and whether that API is `relayhub-java` itself or a separate purpose-built demo API — ADR-0002 documents a provisional contract only; going live against a real backend needs its own follow-up ADR once that backend actually exists (see `docs/product/goals.md`, "Long-term direction").
- Whether `cleanbrain-me-entrance`'s `Service.status` for this project should be `planned` during development or only added once this site is actually live (mirrors `cleanbrain-me-entrance`'s own open decision on showing pre-launch entries).
