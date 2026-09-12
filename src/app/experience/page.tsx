import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { profile } from "@/content/profile";
import { experienceFocusAreas } from "@/content/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Engineering focus areas and the kind of problems this experience has been applied to.",
};

export default function ExperiencePage() {
  return (
    <Container>
      <section className="py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Experience
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          {profile.yearsOfExperience} years across Java/Spring and TypeScript/Node.js/NestJS
          backend systems. Presented here by focus area rather than as a company-by-company
          timeline — each area links to the Projects or Case Studies where it shows up concretely.
        </p>
      </section>
      <div className="space-y-8 pb-20">
        {experienceFocusAreas.map((area) => (
          <section key={area.slug} className="border-t border-border pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-lg font-semibold text-foreground">{area.title}</h2>
            <p className="mt-2 text-muted">{area.description}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {area.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
