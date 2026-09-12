import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RelayHubLab } from "@/components/relayhub/relayhub-lab";

export const metadata: Metadata = {
  title: "RelayHub Live Lab",
  description:
    "Generate a synthetic event and watch it move through ingestion, validation, transformation, delivery, retry, and DLQ/replay.",
};

export default function RelayHubLabPage() {
  return (
    <Container>
      <section className="py-12 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          RelayHub Live Lab
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Generate a synthetic event under a predefined scenario and watch it move through the
          same ingestion, validation, transformation, delivery, retry, and DLQ/replay pipeline
          RelayHub actually implements. All data on this page is synthetic — see{" "}
          <Link href="/projects/relayhub" className="text-accent hover:underline">
            the RelayHub project page
          </Link>{" "}
          for the real, live system this simulates.
        </p>
      </section>
      <RelayHubLab />
    </Container>
  );
}
