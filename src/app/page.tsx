import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function Home() {
  return (
    <Container>
      <section className="py-20 sm:py-28">
        <p className="font-mono text-sm text-accent">Backend Engineer</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Building reliable integrations and observable distributed systems.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Portfolio, production case studies, and a live engineering lab —
          this site is under active construction (Phase 1: app shell).
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/lab"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            Open RelayHub Lab
          </Link>
          <Link
            href="/projects"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Explore Projects
          </Link>
          <Link
            href="/case-studies"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Case Studies
          </Link>
        </div>
      </section>
    </Container>
  );
}
