import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { LiveServiceCard } from "@/components/lab/live-service-card";
import { liveServices } from "@/content/live-services";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Live Systems",
  description: "Real, live-monitored production services — pick one to see its real-time activity.",
  path: "/lab",
});

// A real overview page, not a redirect — the single-service shortcut this
// repo had earlier only made sense while RelayHub was the only Live
// destination (see docs/decisions/ADR-0006's Update for this change). A
// future relayhub-<lang> sibling just adds an entry to
// src/content/live-services.ts; no change needed here.
export default function LabIndexPage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Live Systems
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Real, live-monitored production services — not a simulation. Pick one to see its
          real-time activity.
        </p>
      </section>
      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2">
        {liveServices.map((service) => (
          <LiveServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Container>
  );
}
