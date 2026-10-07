export interface LiveService {
  slug: string;
  name: string;
  language: string;
  baseUrl: string;
  description: string;
  status: "live" | "coming-soon";
}

/**
 * Every Live system this site shows real, cross-origin data from. A future
 * `relayhub-<lang>` sibling (see cleanbrain-me-infra's README, "developer.
 * cleanbrain.me subdomain namespace", citing relayhub-java's own ADR-0002) is
 * a separately deployed instance of the same RelayHub API contract, not a
 * different product — it gets its own entry here with its own slug, never a
 * rename of this one, so the existing /lab/relayhub URL never breaks.
 */
export const liveServices: LiveService[] = [
  {
    slug: "relayhub",
    name: "RelayHub",
    language: "Java",
    baseUrl: "https://relayhub-java.developer.cleanbrain.me",
    description:
      "Event-driven integration platform: ingest, validate, transform, and deliver to downstream targets, with retry, dead-letter handling, replay, and metrics.",
    status: "live",
  },
];

export function getLiveServiceBySlug(slug: string): LiveService | undefined {
  return liveServices.find((service) => service.slug === slug);
}
