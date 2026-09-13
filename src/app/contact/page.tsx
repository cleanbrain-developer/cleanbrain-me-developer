import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { profile } from "@/content/profile";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "How to reach cleanbrain.developer.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Contact
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          The fastest ways to reach {profile.name}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.links.email}`}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            {profile.links.email}
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 border-t border-border py-12 pb-20 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="About"
            title={profile.role}
            description={`${profile.yearsOfExperience} years across Java/Spring and TypeScript/Node.js/NestJS backend systems.`}
          />
          <Link href="/profile" className="mt-4 inline-block text-sm text-accent hover:underline">
            Full profile &rarr;
          </Link>
        </div>
        <div>
          <SectionHeading
            eyebrow="More"
            title="Before you reach out"
            description="A few places that answer most questions faster than an email round-trip."
          />
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/resume" className="text-sm text-accent hover:underline">
              Resume — focus areas, tech stack &rarr;
            </Link>
            <Link href="/lab" className="text-sm text-accent hover:underline">
              RelayHub Live Monitoring — real production telemetry &rarr;
            </Link>
            <Link href="/case-studies" className="text-sm text-accent hover:underline">
              Case studies — production incidents, root cause, trade-offs &rarr;
            </Link>
            <Link href="/architecture" className="text-sm text-accent hover:underline">
              Architecture — the engineering principles behind this site &rarr;
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
