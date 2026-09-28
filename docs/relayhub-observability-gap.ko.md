> 이 문서는 [`relayhub-observability-gap.md`](relayhub-observability-gap.md)의 한국어 번역본입니다. 영어 원본이 canonical이며, 충돌 시 영어 원본이 우선합니다.

# RelayHub Observability Gap

Live activity drill-down(`ActivityDetailSheet`)이 실제로 보여주는 것 — `relayhub-java`의 real API response에서 직접 가져온 것 — 그리고 보여주지 않는 것을 정리합니다: 몇몇 UX 개선 spec이 요청했지만 backend가 실제로는 제공하지 않는 field 몇 개가 있습니다. 이 사이트 자체의 "backend가 반환하지 않는 field는 절대 지어내지 않는다" 규칙에 따라, 아래의 없는 field들은 UI에서 그냥 표시되지 않을 뿐이지, 만들어내지 않습니다.

`relayhub-java`의 실제 source(`src/main/java/me/cleanbrain/relayhub/delivery/`)를 읽어서 확인했으며, 그 repo의 문서만 보고 가정하지 않았습니다.

## 오늘 사용 가능한 것

`GET /api/delivery-attempts/{id}`(`DeliveryAttemptResponse`, 2026-09-29부터 public — 아래 참고)에서:

- `id`, `deliveryId`, `eventId`, `subscriptionId`, `targetId`
- `attemptNumber`
- `status`(`SUCCESS` / `FAILED`)
- `requestMethod`, `requestUrl`, `requestBody`
- `httpStatus`, `responseBody`, `errorMessage`
- `attemptedAt`

`GET /api/deliveries/{deliveryId}/attempts`(`DeliveryAttemptResponse[]`, `attemptNumber` 순서)에서:

- 해당 delivery의 완전하고 real한 재시도 이력 — 그 delivery를 위해 이루어진 모든 attempt를 순서대로. drill-down의 "Retry history" 목록이 렌더링하는 것이 바로 이것이며, 합성되거나 상한이 걸린 sequence가 아닙니다.

둘 다 `GET`이고 public이며 `https://developer.cleanbrain.me`를 위해 CORS-whitelist되어 있습니다. `/api/delivery-attempts/**`는 2026-09-17부터 2026-09-29까지 admin-gate되어 있다가, maintainer가 다시 열었습니다: `relayhub-java`에 붙은 모든 Source/Target은 `relayhub-demo-systems` 아래에서 synthetic traffic만 생성하는 데모 시스템이라서, gate가 보호하던 "real한 payload content"가 이 배포에는 애초에 존재하지 않습니다 — 전체 근거는 `relayhub-java` 자체의 `docs/status/current-state.md`(2026-09-29)와 `SecurityConfig.java`의 "실제 Target이 연결되면 다시 검토하라"는 명시적인 note를 참고하세요.

## 사용할 수 없는 것 — UI에서 생략됨, 지어내지 않음

- **Trace ID.** `DeliveryAttempt`/`Delivery`에는 distributed-tracing correlation id가 존재하지 않습니다. `relayhub-java`는 Micrometer tracing이 연결되어 있긴 하지만(`management.tracing.sampling.probability`), production에서는 `0`으로 설정되어 있고(Zipkin backend가 배포되어 있지 않음), 설령 켜져 있더라도 그건 APM trace id이지 이 DTO들에 노출된 field가 아닙니다. 유용해지려면 `DeliveryAttempt`에 새 field(예: attempt 시점의 tracing context에서 채워지는)와 production Zipkin/tracing backend가 필요할 것입니다.
- **Attempt별 latency.** `DeliveryAttempt`는 start/end 쌍이나 duration field가 아니라 단일 `attemptedAt` timestamp만 가지고 있습니다. backend가 outbound call이 시작된 시점을 기록된 시점에 더해 기록하고, 그 차이(혹은 두 timestamp 모두)를 DTO에 노출해야 할 것입니다.
- **명시적인 sub-stage timeline**(예: "Validation → Transformation → Delivery"를 개별적으로 timestamp가 찍힌 별개의 단계로). `LiveEvent.stage`는 SSE 수준에서 `ingress` / `delivery` / `dlq`만 구분하며, `DeliveryAttempt`는 attempt 수준의 request/response만 추적할 뿐 중간 pipeline 단계는 추적하지 않습니다. 대신 drill-down은 real한 것을 보여줍니다: delivery별 번호가 매겨진 attempt sequence로, "무슨 일이 있었고 몇 번 일어났는지"에 대한 정확한(다소 거칠지만) 그림입니다.

## 만약 이것들 중 무언가가 만들 가치가 있어진다면

- Trace ID: `delivery_attempt`에 `traceId`/`correlationId` column을 추가하고(또는 production에서 tracing이 켜지면 기존 Micrometer trace id를 재사용하고), attempt 생성 시점에 채우고, `DeliveryAttemptResponse`에 추가합니다.
- Latency: `startedAt`(또는 `durationMs`) column을 추가하고, `DeliveryService`의 실제 outbound HTTP call 주변에서 채우고, `DeliveryAttemptResponse`에 추가합니다.
- Sub-stage timeline: validation/transformation 단계를 log line이 아니라 실제로 first-class하고 영속화된 event로 계측해야 할 것입니다 — 이는 `relayhub-java`에게 더 큰 design 결정이며, 간단한 DTO 추가가 아니고, 이 문서가 규정할 범위 밖입니다.

위의 어떤 것도 계획된 작업이 아닙니다 — 이 문서는 미래의 세션이 "drill-down이 왜 X를 보여주지 않는가"에 대해 처음부터 다시 조사하지 않고도 정직하고 source로 검증된 답을 가질 수 있도록 존재합니다.
