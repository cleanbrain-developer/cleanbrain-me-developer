import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { LiveTopology } from "@/components/relayhub/live-observability/live-topology";
import { LiveDashboard } from "@/components/relayhub/live-observability/live-dashboard";
import { liveServices, getLiveServiceBySlug } from "@/content/live-services";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return liveServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getLiveServiceBySlug(slug);
  if (!service) return {};
  return pageMetadata({
    title: `${service.name} Live`,
    description: `Real-time activity from ${service.name} (${service.language}), pushed over SSE as it happens — ingestion, delivery, retry, and DLQ, animated live.`,
    path: `/lab/${service.slug}`,
  });
}

export default async function LiveServiceDetailPage({ params }: PageProps<"/lab/[slug]">) {
  const { slug } = await params;
  const service = getLiveServiceBySlug(slug);
  if (!service) notFound();

  return (
    <Container>
      <section className="py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {service.name} Live
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Real-time activity from <code className="font-mono text-xs">{new URL(service.baseUrl).hostname}</code>,
          the actual deployed {service.language} instance behind{" "}
          <Link href="/projects/relayhub" className="text-accent hover:underline">
            this project
          </Link>{" "}
          — pushed live over SSE as it happens, not a simulation and not a poll.
        </p>
      </section>

      <LiveTopology service={service} />

      <section className="py-12">
        <h2 className="text-lg font-semibold text-foreground">Aggregate stats</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The same real service, summarized: totals and rate trends over the last 30 minutes.
        </p>
        <div className="mt-6">
          <LiveDashboard service={service} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <h2 className="text-lg font-semibold text-foreground">How this works</h2>
        <p className="mt-2 max-w-2xl text-muted">
          relayhub-demo-systems generates continuous synthetic traffic against the real deployed
          service around the clock. Both sections above are read directly from that service&apos;s
          public endpoints — the topology animation from its real-time SSE activity stream, the
          aggregate stats from its delivery-summary and Prometheus-backed metrics endpoints — see{" "}
          <Link href="/architecture" className="text-accent hover:underline">
            Architecture
          </Link>{" "}
          for why it&apos;s built this way.
        </p>
      </section>
    </Container>
  );
}
