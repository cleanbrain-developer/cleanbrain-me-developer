import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <Container>
      <PlaceholderSection
        title="Experience"
        description="A summary of roles, problem scope, and the systems worked on. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
