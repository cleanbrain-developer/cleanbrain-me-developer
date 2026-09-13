import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RelayHubLab } from "@/components/relayhub/relayhub-lab";
import { LiveObservabilityPanel } from "@/components/relayhub/live-observability/live-observability-panel";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RelayHub Live Lab",
  description:
    "Generate a synthetic event and watch it move through ingestion, validation, transformation, delivery, retry, and DLQ/replay.",
  path: "/lab/relayhub",
});

export default function RelayHubLabPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          RelayHub Live Lab
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Generate a synthetic event under a predefined scenario and watch it move through the
          same ingestion, validation, transformation, delivery, retry, and DLQ/replay pipeline
          RelayHub actually implements. All data on this page is synthetic — see{" "}
          <Link href="/projects/relayhub" className="text-accent hover:underline">
            the RelayHub project page
          </Link>{" "}
          for the real, live system this simulates.
        </p>
      </section>
      <RelayHubLab />

      <section className="py-12 sm:py-16">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Beyond the simulation
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Everything above is a client-side simulation. Below is real telemetry read live from{" "}
          <code className="font-mono text-xs">relayhub-java.developer.cleanbrain.me</code>, the
          actual deployed service.
        </p>
        <div className="mt-6">
          <LiveObservabilityPanel />
        </div>
      </section>
    </Container>
  );
}
