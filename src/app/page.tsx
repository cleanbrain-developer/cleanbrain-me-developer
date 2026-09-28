import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { FocusAreaGrid } from "@/components/portfolio/focus-area-grid";
import { ImpactStats } from "@/components/portfolio/impact-stats";
import { LiveSignal } from "@/components/portfolio/live-signal";
import { ProjectCard } from "@/components/project/project-card";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { Button } from "@/components/ui/button";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { caseStudies } from "@/content/case-studies";
import { experienceFocusAreas } from "@/content/experience";
import { impactStats } from "@/content/impact";

// This is a static export (ADR-0003) — the root page used to client-side
// redirect() to /lab/relayhub so the Live console would be the first thing a
// real browser saw. That traded away everything a crawler/no-JS client would
// see, and made the RelayHub console read as this site's whole identity
// rather than one part of an engineering portfolio (maintainer feedback,
// ADR-0006). The root page is now real, static content instead: the Live
// signal lives here as evidence alongside the portfolio narrative, and
// /lab/relayhub remains the full animated console one click away.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.summary,
  url: "https://developer.cleanbrain.me",
  sameAs: [profile.links.github],
  knowsAbout: experienceFocusAreas.map((area) => area.shortLabel),
};

export default function Home() {
  const featuredProjects = projects.filter((project) => project.featured);
  const selectedCaseStudies = caseStudies.slice(0, 2);

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero + Live Signal */}
      <section className="grid grid-cols-1 gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-mono text-sm text-accent">{profile.role}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {profile.tagline}
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/lab/relayhub">Open RelayHub Live</Button>
            <Button href="/projects" variant="secondary">
              Explore Projects
            </Button>
            <Button href="/case-studies" variant="secondary">
              Case Studies
            </Button>
          </div>
        </div>
        <LiveSignal />
      </section>

      {/* Impact */}
      <section className="py-12">
        <SectionHeading
          eyebrow="Impact"
          title="Numbers behind the focus areas"
          description="Outcomes, not claims — the scale and results this experience has actually been applied at."
        />
        <div className="mt-6">
          <ImpactStats items={impactStats} />
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

      {/* Engineering Focus */}
      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Focus" title="Engineering focus" />
          <Link href="/experience" className="text-sm text-accent hover:underline">
            See the detail behind each area &rarr;
          </Link>
        </div>
        <div className="mt-6">
          <FocusAreaGrid items={experienceFocusAreas.map((area) => area.shortLabel)} />
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
          <Button href="/resume" variant="secondary">
            View Resume
          </Button>
          <Button href={profile.links.github} variant="secondary">
            GitHub
          </Button>
          <Button href="/contact" variant="secondary">
            Contact
          </Button>
        </div>
      </section>
    </Container>
  );
}
