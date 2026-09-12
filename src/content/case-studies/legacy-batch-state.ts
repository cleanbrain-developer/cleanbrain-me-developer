import type { CaseStudy } from "@/content/types";

export const legacyBatchState: CaseStudy = {
  slug: "legacy-batch-state",
  title: "Legacy State vs. New Configuration in Batch Processing",
  summary:
    "A batch job that applied configuration changes across many existing records assumed every record's state shape matched the current configuration schema — an assumption that broke down for records created under an older configuration. This is a composite, abstracted scenario — no real company, customer, or system names are used.",
  context:
    "A batch process periodically applied configuration-driven rules to a large set of existing records. The configuration schema evolved over time as new rule types were added.",
  problem:
    "Records created under an older configuration version carried a state shape that predated some of the newer rule types. The batch job's newer logic assumed every record already had the fields the new rules expected, and either skipped those records silently or failed processing them entirely.",
  symptoms: [
    "A subset of older records stopped being updated by the batch job after a configuration change, with no error visible unless someone specifically checked those records.",
    "Newer records, created after the configuration change, were unaffected — making the problem easy to miss in normal spot-checks.",
  ],
  constraints: [
    "Recreating every affected legacy record from scratch was not viable — there were too many, and some had downstream references that made deletion/recreation risky.",
    "Rolling back the configuration schema change was not acceptable, since newer records already depended on it.",
  ],
  investigation:
    "Comparing a failing legacy record against a working newer record side by side showed the missing fields directly; the harder part was determining how many other legacy records shared the same gap and whether the gap was uniform or varied by how old the record was.",
  rootCause:
    "The batch job's rule-application logic was written against the current schema version only, with no explicit migration or default-filling step for records still holding an older schema shape.",
  solution:
    "Added an explicit state-migration step that ran before rule application: for a record missing fields introduced by a newer configuration version, it derived safe defaults instead of assuming the fields already existed. This let the same batch job's rule logic run uniformly across old and new records.",
  tradeoffs: [
    "Chose an in-place migration step over a one-time bulk backfill, so records not yet touched by the batch job would still self-migrate correctly whenever they were eventually processed, rather than depending on a backfill having already run.",
    "Accepted a small amount of permanent complexity in the batch job (the migration step never fully goes away) in exchange for not needing a coordinated, one-time data migration event.",
  ],
  result:
    "Previously-skipped legacy records resumed being processed correctly by the batch job; no quantitative before/after metrics are published here, since this is an abstracted composite scenario rather than a specific production incident with disclosable numbers.",
  lessonsLearned: [
    "A configuration or schema change is not complete until existing records under the old shape are accounted for — 'it works for records created from now on' is an incomplete rollout, not a finished one.",
    "An in-place, self-migrating read/process path is often more robust than a one-time backfill, because it doesn't depend on the backfill having actually reached every record before something else assumes it has.",
  ],
};
