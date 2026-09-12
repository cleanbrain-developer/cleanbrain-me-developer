import type { CaseStudy } from "@/content/types";

export const approvalRollbackTimeout: CaseStudy = {
  slug: "approval-rollback-timeout",
  title: "Timeout and Concurrency Issues in an External-Approval Rollback Flow",
  summary:
    "A workflow that depended on an external system's approval step had a rollback path that assumed the approval call would complete quickly and exactly once. Neither assumption held under real conditions. This is a composite, abstracted scenario — no real company, customer, or system names are used.",
  context:
    "A business process required calling out to an external system for approval before continuing, with a defined rollback path if the approval was rejected or failed. The external call went through a paginated, asynchronous callback mechanism rather than a simple synchronous response.",
  problem:
    "When the external system was slow or its callback was delayed, the calling process's own timeout would fire first, triggering a rollback — while the external approval could still arrive afterward and try to continue a process that had already been rolled back.",
  symptoms: [
    "Occasional processes ended up in a state that reflected both 'rolled back' and 'approved,' depending on which path won the race.",
    "The failure rate correlated with the external system's own load, not with anything in the calling process's normal behavior.",
  ],
  constraints: [
    "The external system's approval mechanism (paginated, async callback) could not be changed — it belonged to a system outside this team's control.",
    "The calling process needed a timeout of some kind; waiting indefinitely was not acceptable to its own callers.",
  ],
  investigation:
    "Traced a handful of affected processes end-to-end and found that the rollback and the late-arriving approval callback were both writing to the same process state without checking whether the other had already acted — a straightforward concurrency gap once the timeline was reconstructed, but easy to miss when looking at either path in isolation.",
  rootCause:
    "The rollback-on-timeout path and the approval-callback path were implemented as if they were mutually exclusive, but nothing actually prevented both from running for the same process.",
  solution:
    "Added an explicit state check-and-transition (only act if the process is still in the 'awaiting approval' state) before either the rollback path or the callback path was allowed to mutate the process, so whichever one ran first would make the other a safe no-op instead of a conflicting write.",
  tradeoffs: [
    "A late approval callback that lost the race is now simply ignored (logged, not applied) rather than reconciled — accepted because by the time it arrives the process has already committed to the rolled-back path from the caller's perspective.",
    "This added a small amount of state-tracking overhead to every process, in exchange for eliminating the class of double-write bug.",
  ],
  result:
    "The double-write pattern stopped appearing after the state check-and-transition was added; no quantitative before/after metrics are published here, since this is an abstracted composite scenario rather than a specific production incident with disclosable numbers.",
  lessonsLearned: [
    "Any flow with an external, asynchronous approval step needs to treat 'timeout followed by a late response' as a normal case to design for, not an edge case to hope doesn't happen.",
    "A timeout-triggered rollback and a callback-triggered continuation are two writers to the same state — if that isn't obvious from the code structure, it is worth drawing out explicitly before trusting the flow.",
  ],
};
