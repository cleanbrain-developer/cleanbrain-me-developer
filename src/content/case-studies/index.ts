import type { CaseStudy } from "@/content/types";
import { distributedDeliveryRaceCondition } from "@/content/case-studies/distributed-delivery-race-condition";
import { approvalRollbackTimeout } from "@/content/case-studies/approval-rollback-timeout";
import { legacyBatchState } from "@/content/case-studies/legacy-batch-state";

export const caseStudies: CaseStudy[] = [
  distributedDeliveryRaceCondition,
  approvalRollbackTimeout,
  legacyBatchState,
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}
