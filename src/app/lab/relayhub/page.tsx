import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { LiveDashboard } from "@/components/relayhub/live-observability/live-dashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RelayHub Live Monitoring",
  description:
    "Real, live production telemetry from relayhub-java — delivery outcomes, DLQ, and ingress rate, refreshed automatically.",
  path: "/lab/relayhub",
});

export default function RelayHubLabPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          RelayHub Live Monitoring
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Real telemetry from{" "}
          <code className="font-mono text-xs">relayhub-java.developer.cleanbrain.me</code>, the
          actual deployed event-integration platform behind{" "}
          <Link href="/projects/relayhub" className="text-accent hover:underline">
            this project
          </Link>{" "}
          — not a simulation.
        </p>
      </section>

      <LiveDashboard />

      <section className="py-12 sm:py-16">
        <h2 className="text-lg font-semibold text-foreground">How this works</h2>
        <p className="mt-2 max-w-2xl text-muted">
          relayhub-demo-systems generates continuous synthetic traffic against the real
          relayhub-java deployment around the clock. The numbers above are read directly from
          that service&apos;s public delivery-summary, targets, and Prometheus-backed metrics
          endpoints — see{" "}
          <Link href="/architecture" className="text-accent hover:underline">
            Architecture
          </Link>{" "}
          for why it&apos;s built this way.
        </p>
      </section>
    </Container>
  );
}
