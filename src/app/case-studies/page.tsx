import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return (
    <Container>
      <PlaceholderSection
        title="Case Studies"
        description="Production engineering write-ups: context, problem, investigation, root cause, trade-offs, and lessons learned. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
