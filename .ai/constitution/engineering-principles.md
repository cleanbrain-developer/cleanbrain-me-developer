# Engineering Principles

This document defines engineering principles that should outlive a technology choice or an individual feature in this repository.

## Evidence before change

Inspect existing documentation and implementation first. Prefer repository evidence over assumptions, and do not propose changes based on a structure that has not been verified.

## Minimal, coherent change

Prefer the smallest coherent change that satisfies the requirement. This is a portfolio site with a mock engineering lab, not a production event-processing platform — do not add a real backend, database, or authentication layer until a real requirement forces it (see `docs/product/scope.md`).

## Explicit architecture

Do not change architectural boundaries or conventions silently. Surface decisions that have long-term impact or are difficult to reverse — for example, introducing a real `HttpRelayHubAdapter` and backend dependency, adding a CMS, or adding a state-management library — and record them in an ADR before or with implementation.

## Verifiable outcomes

Produce outcomes that can be verified. Run lint, typecheck, and the test suite once they exist; otherwise state the verification method and its limitations. A green automated check is evidence about the code; direct verification against the running app (browser, real route) is evidence about reality — prefer the second whenever a UI or interaction claim is being made.

## Content over code

Portfolio content — profile, experience, project descriptions, case studies — lives under `src/content/`, never hardcoded inside presentation components. Adding or editing content must not require touching a component.

## Adapter boundary for the RelayHub Lab

The RelayHub Live Lab UI must depend only on the `RelayHubAdapter` interface, never on `fetch()` or a concrete implementation directly. `MockRelayHubAdapter` and any future `HttpRelayHubAdapter` are interchangeable behind this boundary (see `docs/architecture/overview.md`).

## Demo safety is non-negotiable

The public Live Lab only ever accepts a predefined event type and scenario, and only ever operates on synthetic data. Arbitrary URL, header, script, or credential input from a visitor must never be implemented, even as a convenience or a "temporary" affordance (see `docs/product/scope.md`).

## Separated boundaries

Keep domain concerns (content, RelayHub Lab domain types, adapters) separate from external systems and tooling (build tool, container runtime, Kubernetes deployment). Deployment and infrastructure concerns belong to the `cleanbrain-me-infra` repository, not to this repository's source tree.
