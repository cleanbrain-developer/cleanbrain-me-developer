"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchDeliveryAttempt,
  fetchDeliveryAttempts,
  type RelayHubDeliveryAttempt,
  type RelayHubLiveEvent,
} from "@/lib/relayhub/live-topology";

type DrillableEvent = RelayHubLiveEvent & { attemptId: string };

/**
 * Click-through detail for one "delivery" row in the Recent Activity table:
 * the specific attempt's real request/response/error, plus the delivery's
 * full real retry history (not a fabricated stage timeline — relayhub-java
 * has no "validation"/"transformation" sub-stage tracking, only
 * ingress/delivery/dlq and, per delivery, a numbered attempt sequence).
 * Public since 2026-09-29 (see relayhub-java's SecurityConfig.java) — every
 * Source/Target attached to that deployment is a demo system generating
 * synthetic traffic, so there's no real payload behind these fields.
 */
export function ActivityDetailSheet({
  event,
  onClose,
}: {
  event: DrillableEvent | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetClose />
      {event && <ActivityDetailContent key={event.attemptId} event={event} />}
    </Sheet>
  );
}

/**
 * Keyed by `event.attemptId` in the parent, so opening a *different* attempt
 * mounts a fresh instance (default-undefined state) instead of needing to
 * reset state synchronously inside an effect — the Sheet's overlay blocks
 * clicking a different row while one is already open, so this never needs to
 * handle an open-to-open transition, only mount-to-unmount.
 */
function ActivityDetailContent({ event }: { event: DrillableEvent }) {
  const [attempt, setAttempt] = useState<RelayHubDeliveryAttempt>();
  const [history, setHistory] = useState<RelayHubDeliveryAttempt[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchDeliveryAttempt(event.attemptId)
      .then((a) => {
        setAttempt(a);
        return fetchDeliveryAttempts(a.deliveryId);
      })
      .then(setHistory)
      .catch(() => setError("Couldn't load this attempt's detail from relayhub-java."));
  }, [event.attemptId]);

  return (
    <>
      <SheetTitle>
        {event.sourceKey} &rarr; {event.targetKey}
      </SheetTitle>
      <SheetDescription>
        {event.stage} · {event.status}
        {event.replay ? " · replay" : ""} · {new Date(event.at).toLocaleString()}
      </SheetDescription>

      <div className="mt-6 flex-1 overflow-y-auto">
        {error ? (
          <p className="text-sm text-muted">{error}</p>
        ) : !attempt || !history ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Retry history</h3>
              <ol className="mt-2 space-y-2">
                {history.map((a) => (
                  <li
                    key={a.id}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                      a.id === attempt.id ? "border-accent bg-accent/10" : "border-border"
                    }`}
                  >
                    <span className="text-foreground">Attempt {a.attemptNumber}</span>
                    <Badge tone={a.status === "SUCCESS" ? "success" : "danger"}>{a.status}</Badge>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Attempt {attempt.attemptNumber} detail
              </h3>
              <dl className="mt-2 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Request</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-foreground">
                    {attempt.requestMethod} {attempt.requestUrl}
                  </dd>
                </div>
                {attempt.httpStatus !== null && (
                  <div>
                    <dt className="text-muted">HTTP status</dt>
                    <dd className="mt-1 font-mono text-xs text-foreground">{attempt.httpStatus}</dd>
                  </div>
                )}
                {attempt.errorMessage && (
                  <div>
                    <dt className="text-muted">Error</dt>
                    <dd className="mt-1 text-destructive">{attempt.errorMessage}</dd>
                  </div>
                )}
                {attempt.responseBody && (
                  <div>
                    <dt className="text-muted">Response body</dt>
                    <dd className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap break-all rounded-md bg-background p-2 font-mono text-xs text-foreground">
                      {attempt.responseBody}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </>
        )}
      </div>
    </>
  );
}
