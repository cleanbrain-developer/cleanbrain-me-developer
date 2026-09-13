import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { FocusAreaGrid } from "@/components/portfolio/focus-area-grid";
import { ProjectCard } from "@/components/project/project-card";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profile",
  description: profile.tagline,
  path: "/profile",
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.summary,
  url: "https://developer.cleanbrain.me",
  sameAs: [profile.links.github],
  knowsAbout: profile.focusAreas,
};

export default function ProfilePage() {
  const featuredProjects = projects.filter((project) => project.featured);
  const selectedCaseStudies = caseStudies.slice(0, 2);

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <p className="font-mono text-sm text-accent">{profile.role}</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {profile.tagline}
        </h1>
        <p className="mt-4 max-w-xl text-muted">{profile.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/lab"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            Open Live Monitoring
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

      {/* Engineering Focus */}
      <section className="py-12">
        <SectionHeading eyebrow="Focus" title="Engineering focus" />
        <div className="mt-6">
          <FocusAreaGrid items={profile.focusAreas} />
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Projects"
            title="Featured projects"
            description="Written as problem, architecture, decisions, failure handling, and result — not a technology list."
          />
          <Link href="/projects" className="text-sm text-accent hover:underline">
            View all projects &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* Live Monitoring */}
      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Live"
            title="RelayHub live monitoring"
            description="Real production telemetry read directly from relayhub-java, refreshed automatically — not a simulation."
          />
          <Link href="/lab" className="text-sm text-accent hover:underline">
            Open Live Monitoring &rarr;
          </Link>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted">
            Delivery outcomes, DLQ depth, and live ingress rate from the actual deployed service —
            see it update in real time on the{" "}
            <Link href="/lab" className="text-accent hover:underline">
              Live Monitoring dashboard
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Selected Case Studies */}
      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Case Studies"
            title="Selected case studies"
            description="Abstracted production engineering scenarios: investigation, root cause, trade-offs, and lessons learned."
          />
          <Link href="/case-studies" className="text-sm text-accent hover:underline">
            View all case studies &rarr;
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {selectedCaseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      </section>

      {/* Architecture / Platform Snapshot */}
      <section className="py-12">
        <SectionHeading
          eyebrow="Platform"
          title="Architecture & platform snapshot"
          description="Every project here runs on the same Hetzner k3s cluster, behind a single shared Gateway, deployed by its own CI pipeline."
        />
        <div className="mt-6">
          <Link href="/architecture" className="text-sm text-accent hover:underline">
            Read the architecture principles &rarr;
          </Link>
        </div>
      </section>

      {/* Resume / GitHub / Contact */}
      <section className="py-12 pb-20">
        <SectionHeading eyebrow="More" title="Resume & contact" />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/resume"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            View Resume
          </Link>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            GitHub
          </a>
          <Link
            href="/contact"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Contact
          </Link>
        </div>
      </section>
    </Container>
  );
}
