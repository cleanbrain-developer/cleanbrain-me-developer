import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "RelayHub Live Lab" };

export default function RelayHubLabPage() {
  return (
    <Container>
      <PlaceholderSection
        title="RelayHub Live Lab"
        description="Generate a synthetic event and watch it move through ingestion, validation, transformation, delivery, retry, and DLQ/replay. Backed by MockRelayHubAdapter — lands in Phase 3 (RelayHub Lab Mock)."
      />
    </Container>
  );
}
