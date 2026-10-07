"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardLabel, CardValue } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { liveServices } from "@/content/live-services";
import {
  fetchRelayHubLiveObservability,
  type RelayHubLiveObservability,
} from "@/lib/relayhub/live-observability";
import { fetchTopology, openLiveActivityStream, type RelayHubLiveEvent } from "@/lib/relayhub/live-topology";

// Always the flagship entry in the registry (src/content/live-services.ts),
// not a configurable prop — this is the home page's single "is this real?"
// proof, not a per-service view (that's /lab/[slug]).
const flagship = liveServices[0];

const FLASH_MS = 700;

/**
 * The home page's "is this real?" proof, condensed to a glance — three real
 * numbers plus an abbreviated node diagram, both read from relayhub-java's
 * already-public endpoints (see docs/decisions/ADR-0004). Deliberately not a
 * clone of LiveTopology's physics-based pulse/explosion engine: this opens
 * its own lightweight SSE subscription only to flash which side of the
 * diagram just saw traffic, not to animate a missile along a path. The full,
 * fully-animated console lives at /lab/relayhub.
 */
export function LiveSignal() {
  const [data, setData] = useState<RelayHubLiveObservability>();
  const [nodes, setNodes] = useState<{ sources: string[]; targets: string[] }>();
  const [connected, setConnected] = useState(false);
  const [flash, setFlash] = useState<RelayHubLiveEvent["stage"]>();
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    fetchRelayHubLiveObservability(flagship.baseUrl)
      .then(setData)
      .catch(() => {});
    fetchTopology(flagship.baseUrl)
      .then((topo) =>
        setNodes({
          sources: topo.sources.map((s) => s.key).slice(0, 2),
          targets: topo.targets.map((t) => t.key).slice(0, 2),
        }),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    return openLiveActivityStream(
      flagship.baseUrl,
      (event) => {
        setFlash(event.stage);
        if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setFlash(undefined), FLASH_MS);
      },
      setConnected,
    );
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm font-semibold text-foreground">{flagship.name}</p>
        <Badge tone={connected ? "live" : "default"}>{connected ? "● LIVE" : "connecting…"}</Badge>
      </div>

      {data ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card compact>
            <CardLabel>Succeeded</CardLabel>
            <CardValue compact>{data.summary.succeeded.toLocaleString()}</CardValue>
          </Card>
          <Card compact tone={data.summary.dead > 0 ? "danger" : "default"}>
            <CardLabel>DLQ</CardLabel>
            <CardValue compact className={data.summary.dead > 0 ? "text-destructive" : undefined}>
              {data.summary.dead.toLocaleString()}
            </CardValue>
          </Card>
          <Card compact>
            <CardLabel>Events / min</CardLabel>
            <CardValue compact>{data.ingressEventsPerMinute.toFixed(1)}</CardValue>
          </Card>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {nodes ? (
        <div className="mt-6 grid grid-cols-3 items-center gap-2 text-center">
          <div className="flex flex-col items-center gap-2">
            {nodes.sources.map((key) => (
              <span
                key={key}
                className="rounded-md border border-accent/40 px-2 py-1 font-mono text-xs text-muted"
              >
                {key}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className={`rounded-md border px-3 py-1.5 font-mono text-xs font-semibold text-foreground transition-colors ${
                flash === "ingress" || flash === "delivery" ? "border-accent bg-accent/20" : "border-accent/50 bg-accent/10"
              }`}
            >
              RelayHub
            </span>
            <span className={`text-[10px] transition-colors ${flash === "dlq" ? "text-destructive" : "text-muted"}`}>
              DLQ {data ? data.summary.dead : "–"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            {nodes.targets.map((key) => (
              <span
                key={key}
                className="rounded-md border border-success/40 px-2 py-1 font-mono text-xs text-muted"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
