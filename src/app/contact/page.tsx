import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PlaceholderSection } from "@/components/common/placeholder-section";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Container>
      <PlaceholderSection
        title="Contact"
        description="GitHub, email, and other ways to reach out. Content lands in Phase 2 (Portfolio Core)."
      />
    </Container>
  );
}
