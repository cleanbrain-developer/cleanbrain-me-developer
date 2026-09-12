import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { profile } from "@/content/profile";
import { experienceFocusAreas } from "@/content/experience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  description: "Structured summary of focus areas, tech stack, and how to get in touch.",
  path: "/resume",
});

export default function ResumePage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Resume
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          {profile.name} &mdash; {profile.role}, {profile.yearsOfExperience} years of experience.
        </p>
        <p className="mt-2 max-w-2xl text-muted">{profile.summary}</p>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Focus areas
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {experienceFocusAreas.map((area) => (
            <li key={area.slug} className="text-muted">
              {area.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Tech stack
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {profile.techStack.map((area) => (
            <div key={area.label}>
              <h3 className="text-sm font-medium text-foreground">{area.label}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {area.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-surface px-2 py-1 font-mono text-xs text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-8 pb-20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Links
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            GitHub
          </a>
          <a
            href={`mailto:${profile.links.email}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Email
          </a>
        </div>
      </section>
    </Container>
  );
}
