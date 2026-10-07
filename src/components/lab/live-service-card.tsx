import Link from "next/link";
import type { LiveService } from "@/content/live-services";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LivePulse } from "@/components/lab/live-pulse";

export function LiveServiceCard({ service }: { service: LiveService }) {
  const content = (
    <Card className={service.status === "live" ? "transition-colors hover:bg-surface-hover" : "opacity-60"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{service.name}</h2>
        {service.status === "live" ? (
          <LivePulse />
        ) : (
          <Badge>Coming soon</Badge>
        )}
      </div>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">{service.language}</p>
      <p className="mt-2 text-sm text-muted">{service.description}</p>
    </Card>
  );

  if (service.status !== "live") {
    return <div className="block cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={`/lab/${service.slug}`} className="block">
      {content}
    </Link>
  );
}
