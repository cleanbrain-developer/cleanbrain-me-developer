# Goals

## V1 goals

1. A first-time visitor understands within 30–60 seconds that cleanbrain.developer is a backend engineer with distributed-systems, integration, and production-troubleshooting experience — not a generic full-stack portfolio.
2. The homepage surfaces at least two of: "Open RelayHub Lab", "Explore Projects", "View Case Studies" as immediate CTAs.
3. `/lab/relayhub` lets a visitor generate a synthetic event under a predefined scenario (normal, target 500, timeout, validation error) and observe it move through the pipeline stages, including retry → DLQ → replay for failure scenarios.
4. Every project and case study follows the same evidence-oriented structure (problem → architecture → decisions → failure handling → observability → result → lessons learned), never a bare technology list.
5. The public Live Lab never accepts arbitrary URL, header, script, or credential input, and never touches real company, customer, or production data — synthetic data only (see `docs/product/scope.md`).
6. Content (profile, experience, projects, case studies) is config/content-driven under `src/content/`, never hardcoded into presentation components.
7. Ship as a Next.js app that a lightweight container can serve, fitting the `cleanbrain-me-infra` cluster's 2 vCPU / 4 GB RAM constraint (see that repository's README for the current resource budget).

## Success criteria

A new agent session, starting only from `CLAUDE.md` or `AGENTS.md` with no prior conversation, should accurately answer:

- What is this project, and what does it deliberately not do?
- Why does it exist?
- What are its core principles and architecture (including the RelayHub Lab's adapter pattern)?
- What has been completed, and what is the current phase?
- What should happen next?

Every answer must be traceable to a repository path (this document, `docs/architecture/`, `docs/status/current-state.md`, or the source tree), not to assumed context.

## Long-term direction

Possible future extensions, once the mock-backed V1 is deployed and stable:

1. `HttpRelayHubAdapter` calling a real RelayHub demo API for live metrics, live trace timelines, and real DLQ replay.
2. Real analytics on which sections (project detail, Live Lab, case studies, resume) visitors actually reach.
3. Additional projects and case studies as they become real and are ready to publish.

This sequence is a direction, not a commitment. Do not build toward it ahead of an actual requirement (see `docs/product/scope.md`, "Scope rule").
