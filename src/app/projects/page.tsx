import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Container>
      <PlaceholderSection
        title="Projects"
        description="RelayHub and English Core Speaking, each written as problem, architecture, decisions, failure handling, and result. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
