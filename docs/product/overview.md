# Product Overview

## Product

developer.cleanbrain.me is cleanbrain.developer's public developer site, combining three roles in one application:

1. **Developer Profile** — experience summary, tech stack, resume, contact.
2. **Engineering Portfolio** — projects and production case studies, written as problem → architecture → decisions → failure handling → observability → result, not a feature list.
3. **Live Engineering Lab** — an interactive, safe, synthetic-data-only demo (initially: RelayHub) where a visitor generates an event and watches it move through ingestion, validation, transformation, delivery, retry, and DLQ/replay.

## Problem

A resume-style portfolio page asserts backend and distributed-systems experience in prose. A recruiter or engineer visiting the page has no fast way to verify that assertion, and the page looks identical to hundreds of other portfolio sites regardless of how deep the underlying experience actually is.

## Product thesis

> Evidence over claims: instead of writing "I understand distributed systems," the site lets a visitor trigger a synthetic event and watch retry, DLQ, and replay behavior happen.

The site is not a Notion-document clone and not a dashboard mockup with no real information behind it. The Live Lab is real interactive state machine behavior (backed by a mock adapter initially, a real RelayHub API later) — never a static screenshot or a canned animation.

## Users

- **Primary**: backend engineering hiring managers, recruiters, and technical interviewers evaluating cleanbrain.developer, who should understand "this is a backend engineer with production, integration, and observability experience" within 30–60 seconds of landing on `/`.
- **Secondary**: other software engineers browsing the site out of technical interest, who may go deeper into `/architecture`, `/case-studies`, or `/lab/relayhub`.

## Relationship to other repositories

- `english-core-speaking` and `relayhub-java` (with `relayhub-demo-systems`) are real, independently deployed services that this site *describes and links to* under `/projects`; it does not embed or depend on their runtime.
- `cleanbrain-me-infra` owns the production Kubernetes manifest for this service, under the `cleanbrain-me-developer` namespace convention; this repository owns only application source, Dockerfile, and CI.
- `cleanbrain-me-entrance` (`cleanbrain.me`) is the root-domain service directory; once this project is live, `cleanbrain-me-entrance` adds a real (not placeholder) `developer.cleanbrain.me` entry pointing here.

## Open items

- Whether the RelayHub Live Lab ever calls a real `relayhub-java` API (`HttpRelayHubAdapter`) is a later phase (see `docs/product/scope.md`, "Out of scope" and `docs/architecture/overview.md`, "Adapter pattern"). V1 uses `MockRelayHubAdapter` only.
