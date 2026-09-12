import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach cleanbrain.developer.",
};

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
    </Container>
  );
}
