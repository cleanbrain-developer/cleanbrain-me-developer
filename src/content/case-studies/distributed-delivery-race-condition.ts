import type { CaseStudy } from "@/content/types";

export const distributedDeliveryRaceCondition: CaseStudy = {
  slug: "distributed-delivery-race-condition",
  title: "A Race Condition in Distributed Delivery Processing",
  summary:
    "An asynchronous delivery pipeline occasionally left a downstream record in an inconsistent state when a delete and a create for the same logical entity raced each other. This is a composite, abstracted scenario representative of enterprise integration work — no real company, customer, or system names are used.",
  context:
    "An integration pipeline delivered entity updates from a source system to a downstream system asynchronously, via a queue. Each message carried a create, update, or delete for a given entity. Under normal load, messages for the same entity arrived and were processed in order.",
  problem:
    "Under bursty load, a delete for an entity and a subsequent create for the same logical entity (a legitimate 'recreate after remove' business flow) could be picked up by two different concurrent workers. If the create's worker finished before the delete's worker, the delete would run last and remove a record that should have continued to exist.",
  symptoms: [
    "A small percentage of entities intermittently disappeared downstream shortly after being recreated.",
    "The failure was not reproducible on demand — it only appeared under concurrent load, and only for entities that were deleted and recreated within a short window.",
  ],
  constraints: [
    "The downstream system's API had no native conditional-write or version-check support to reject an out-of-order write.",
    "Reprocessing all messages strictly sequentially would have made the pipeline too slow for its actual load.",
  ],
  investigation:
    "Reproducing the issue required deliberately racing a delete and a create for the same entity under concurrent workers rather than replaying messages one at a time — the bug was invisible in any sequential replay or single-worker test.",
  rootCause:
    "The pipeline parallelized work across entities for throughput, but used no ordering or locking guarantee for messages belonging to the same logical entity, so two related messages could be processed out of order by two different workers.",
  solution:
    "Introduced a per-entity ordering key so that messages for the same logical entity are always routed to and processed by the same worker in arrival order, while messages for different entities continue to process in parallel. This preserved most of the pipeline's throughput while removing the specific class of race condition.",
  tradeoffs: [
    "Slightly reduced parallelism for entities that happen to be updated very frequently, in exchange for correctness.",
    "Chose per-entity ordering over a heavier distributed lock, since ordering was sufficient for this failure mode and locking would have added latency to every message, not just the racing ones.",
  ],
  result:
    "The specific disappearing-record symptom stopped recurring after the ordering key was introduced; no quantitative before/after metrics are published here, since this is an abstracted composite scenario rather than a specific production incident with disclosable numbers.",
  lessonsLearned: [
    "A bug that requires concurrent, timing-dependent conditions to reproduce will not be found by sequential replay — the test/reproduction strategy has to match the actual failure mode.",
    "Parallelizing by 'record' instead of by 'entity identity' is a common source of ordering bugs in event-driven pipelines; per-entity ordering is often the cheapest fix that doesn't sacrifice most of the throughput gain.",
  ],
};
