import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <Container>
      <PlaceholderSection
        title="Resume"
        description="Structured, resume-ready information. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
