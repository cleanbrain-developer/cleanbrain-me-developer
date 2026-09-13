import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { pageMetadata } from "@/lib/seo";

// This site is a static export (see next.config.ts) — there is no server to
// issue a real HTTP redirect, and next/navigation's redirect() only takes
// effect after client-side hydration, which a crawler or no-JS client would
// never see. Rather than fight that, /lab is a real (if thin) landing page
// that links to /lab/relayhub — the only Live destination today, per
// docs/product/scope.md.
export const metadata: Metadata = pageMetadata({
  title: "Live",
  description: "RelayHub Live Monitoring: real, live production telemetry, refreshed automatically.",
  path: "/lab",
});

export default function LabIndexPage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Live
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          One live destination today:{" "}
          <Link href="/lab/relayhub" className="text-accent hover:underline">
            RelayHub Live Monitoring
          </Link>{" "}
          — real production telemetry from relayhub-java, refreshed automatically.
        </p>
        <Link
          href="/lab/relayhub"
          className="mt-8 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
        >
          Open Live Monitoring
        </Link>
      </section>
    </Container>
  );
}
