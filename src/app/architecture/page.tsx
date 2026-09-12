import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  return (
    <Container>
      <PlaceholderSection
        title="Architecture"
        description="Why the systems behind these projects are shaped the way they are: event-driven integration, retry/DLQ, idempotency, observability. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
