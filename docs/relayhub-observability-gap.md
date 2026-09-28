# RelayHub Observability Gap

What the Live activity drill-down (`ActivityDetailSheet`) actually shows, sourced directly from `relayhub-java`'s real API responses, and what it doesn't — a couple of UX-refinement specs asked for a couple of fields the backend genuinely does not provide. Per this site's own "never fabricate a field the backend doesn't return" rule, the missing fields below are simply not shown in the UI, not invented.

Verified by reading `relayhub-java`'s actual source (`src/main/java/me/cleanbrain/relayhub/delivery/`), not assumed from its docs.

## Available today

From `GET /api/delivery-attempts/{id}` (`DeliveryAttemptResponse`, public since 2026-09-29 — see below):

- `id`, `deliveryId`, `eventId`, `subscriptionId`, `targetId`
- `attemptNumber`
- `status` (`SUCCESS` / `FAILED`)
- `requestMethod`, `requestUrl`, `requestBody`
- `httpStatus`, `responseBody`, `errorMessage`
- `attemptedAt`

From `GET /api/deliveries/{deliveryId}/attempts` (`DeliveryAttemptResponse[]`, ordered by `attemptNumber`):

- The delivery's complete, real retry history — every attempt made for that delivery, in order. This is what the drill-down's "Retry history" list renders; it is not a synthesized or capped sequence.

Both are `GET`, public, and CORS-whitelisted for `https://developer.cleanbrain.me`. `/api/delivery-attempts/**` was admin-gated from 2026-09-17 until 2026-09-29, when the maintainer reopened it: every Source/Target attached to `relayhub-java` is a demo system under `relayhub-demo-systems` generating synthetic traffic only, so the "real payload content" the gate was protecting doesn't exist in this deployment — see `relayhub-java`'s own `docs/status/current-state.md` (2026-09-29) and `SecurityConfig.java` for the full reasoning, including the explicit "revisit if a real Target is ever connected" note.

## Not available — omitted from the UI, not fabricated

- **Trace ID.** No distributed-tracing correlation id exists on `DeliveryAttempt`/`Delivery`. `relayhub-java` does have Micrometer tracing wired up (`management.tracing.sampling.probability`), but it's set to `0` in production (no Zipkin backend deployed there) and, even if it were on, that's an APM trace id, not a field exposed on these DTOs. Would need a new field on `DeliveryAttempt` (e.g. populated from the tracing context at attempt time) plus a production Zipkin/tracing backend to actually be useful.
- **Per-attempt latency.** `DeliveryAttempt` has a single `attemptedAt` timestamp, not a start/end pair or a duration field. Would need the backend to record when the outbound call was initiated in addition to when it was recorded, and expose the difference (or both timestamps) on the DTO.
- **Explicit sub-stage timeline** (e.g. "Validation → Transformation → Delivery" as distinct, individually-timestamped steps). `LiveEvent.stage` only distinguishes `ingress` / `delivery` / `dlq` at the SSE level, and `DeliveryAttempt` only tracks attempt-level request/response, not intermediate pipeline stages. The drill-down instead shows what's real: the numbered attempt sequence for a delivery, which is an accurate (if coarser) picture of "what happened and how many times."

## If any of this becomes worth building

- Trace ID: add a `traceId`/`correlationId` column to `delivery_attempt` (or reuse an existing Micrometer trace id if tracing is ever turned on in production), populate it at attempt-creation time, add it to `DeliveryAttemptResponse`.
- Latency: add a `startedAt` (or `durationMs`) column, populate around the actual outbound HTTP call in `DeliveryService`, add it to `DeliveryAttemptResponse`.
- Sub-stage timeline: would need actual instrumentation of the validation/transformation steps as first-class, persisted events (not just log lines) — a bigger design decision for `relayhub-java`, not a quick DTO addition, and out of scope for this document to prescribe.

None of the above is planned work — this document exists so a future session has an honest, source-verified answer to "why doesn't the drill-down show X" instead of needing to re-derive it from scratch.
