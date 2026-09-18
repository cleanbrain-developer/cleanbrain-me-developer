"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDeliverySummary,
  fetchDlqSchedule,
  fetchTopology,
  openLiveActivityStream,
  type RelayHubDeliverySummary,
  type RelayHubLiveEvent,
  type RelayHubSource,
  type RelayHubSubscription,
  type RelayHubTarget,
} from "@/lib/relayhub/live-topology";

/**
 * A live, push-driven topology map — ported from relayhub-java's own
 * admin-console Live page (that repo's frontend/src/pages/LivePage.tsx),
 * adapted to run cross-origin against the real deployed service (see
 * docs/decisions/ADR-0004-live-relayhub-observability.md). Backed by
 * Server-Sent Events: this component never polls for activity, relayhub-java
 * pushes one event per ingress call and per delivery attempt.
 *
 * Deliberately narrower than the original: no login-gated "pause the demo
 * generator" control (this site has no auth and no write access to
 * relayhub-java — ADR-0004's "read-only, GET-only" boundary), and no
 * click-through request/response detail on the activity feed (kept to the
 * columns that make the feed useful without adding another cross-origin
 * fetch per row).
 */

interface Point {
  x: number;
  y: number;
}

interface EventNode {
  key: string;
  sourceKey: string;
  eventKey: string;
}

interface Pulse {
  id: number;
  waypoints: Point[];
  arcs: number[];
  legWeights: number[];
  color: string;
  start: number;
  replay: boolean;
}

const NODE_X_SOURCE = 70;
const NODE_X_EVENT = 280;
const HUB_X = 490;
const NODE_X_TARGET = 750;
const NODE_WIDTH_SOURCE = 120;
const NODE_WIDTH_EVENT = 130;
const NODE_WIDTH_TARGET = 150;
const NODE_WIDTH_DLQ = 100;
const NODE_HEIGHT = 36;
const ROW_HEIGHT = 68;
const TOP_MARGIN = 44;
const PULSE_DURATION_MS = 950;
const PULSE_RADIUS = 9;
const MISSILE_SCALE = 1.5;
const COLOR_INGRESS = "#5b8def";
const COLOR_SUCCESS = "#34d399";
const COLOR_FAILED = "#f87171";
const DLQ_COLOR = "#b45309";
const TRAIL_COLORS = ["#fff3b0", "#ffd166", "#ffb703", "#ff8c42"];
const TRAIL_OFFSETS = [0.045, 0.09, 0.14, 0.19, 0.25, 0.32];

const EXPLOSION_PRESETS: Record<
  "ingress" | "success" | "failed" | "dlq",
  { count: number; distance: number; ring: number; colors: string[] }
> = {
  ingress: { count: 8, distance: 20, ring: 18, colors: [COLOR_INGRESS, "#a5b4fc"] },
  success: { count: 14, distance: 38, ring: 32, colors: [COLOR_SUCCESS, "#ffd166", "#6ee7b7"] },
  failed: { count: 20, distance: 56, ring: 56, colors: [COLOR_FAILED, "#ff8c42", "#ffd166"] },
  dlq: { count: 24, distance: 68, ring: 70, colors: [DLQ_COLOR, "#8a8a8a", "#ff8c42", "#c2410c"] },
};

function explosionKind(color: string): keyof typeof EXPLOSION_PRESETS {
  if (color === DLQ_COLOR) return "dlq";
  if (color === COLOR_FAILED) return "failed";
  if (color === COLOR_SUCCESS) return "success";
  return "ingress";
}

const IMPACT_TEXT: Partial<Record<keyof typeof EXPLOSION_PRESETS, string>> = {
  success: "HIT!",
  failed: "BOOM!",
  dlq: "DLQ!",
};

function layout(count: number, x: number): Point[] {
  return Array.from({ length: Math.max(count, 1) }, (_, i) => ({
    x,
    y: TOP_MARGIN + i * ROW_HEIGHT,
  }));
}

function eventNodeKey(sourceKey: string, eventKey: string): string {
  return `${sourceKey}:${eventKey}`;
}

function pointOnLeg(a: Point, b: Point, arc: number, t: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * arc;
  const cy = my + (dx / len) * arc;
  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
  const tx = 2 * (1 - t) * (cx - a.x) + 2 * t * (b.x - cx);
  const ty = 2 * (1 - t) * (cy - a.y) + 2 * t * (b.y - cy);
  return { x, y, angleDeg: (Math.atan2(ty, tx) * 180) / Math.PI };
}

function pointOnPath(p: Pulse, t: number) {
  let acc = 0;
  for (let i = 0; i < p.legWeights.length; i++) {
    const w = p.legWeights[i];
    const isLast = i === p.legWeights.length - 1;
    if (t <= acc + w || isLast) {
      const localT = w > 0 ? Math.min(Math.max((t - acc) / w, 0), 1) : 1;
      return pointOnLeg(p.waypoints[i], p.waypoints[i + 1], p.arcs[i], localT);
    }
    acc += w;
  }
  return pointOnLeg(p.waypoints[0], p.waypoints[1], p.arcs[0], 0);
}

function readyDelay(map: Map<string, number>, key: string, now: number): number {
  const busyUntil = map.get(key);
  return busyUntil !== undefined ? Math.max(0, busyUntil - now) : 0;
}

export function LiveTopology() {
  const [sources, setSources] = useState<RelayHubSource[]>([]);
  const [targets, setTargets] = useState<RelayHubTarget[]>([]);
  const [subscriptions, setSubscriptions] = useState<RelayHubSubscription[]>([]);
  const [summary, setSummary] = useState<RelayHubDeliverySummary>();
  const [dlqNextRunAt, setDlqNextRunAt] = useState<number>();
  const [dlqSecondsLeft, setDlqSecondsLeft] = useState<number>();
  const resyncScheduledRef = useRef(false);
  const summaryRefetchTimer = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [feed, setFeed] = useState<RelayHubLiveEvent[]>([]);
  const [loadError, setLoadError] = useState<string>();

  const [renderedPulses, setRenderedPulses] = useState<(Pulse & { progress: number })[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const pulseId = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastIngressAt = useRef<Map<string, number>>(new Map());
  const lastDeliveryAt = useRef<Map<string, number>>(new Map());

  const [shaking, setShaking] = useState(false);
  const shakeTimer = useRef<number | null>(null);
  function triggerShake(delayMs: number) {
    window.setTimeout(() => {
      setShaking(true);
      if (shakeTimer.current !== null) window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => setShaking(false), 420);
    }, delayMs + PULSE_DURATION_MS * 0.8);
  }

  const [shakingNodes, setShakingNodes] = useState<Set<string>>(new Set());
  const nodeHitTimers = useRef<Map<string, number>>(new Map());
  function triggerNodeHit(nodeKey: string, delayMs: number) {
    window.setTimeout(() => {
      setShakingNodes((prev) => new Set(prev).add(nodeKey));
      const existing = nodeHitTimers.current.get(nodeKey);
      if (existing !== undefined) window.clearTimeout(existing);
      nodeHitTimers.current.set(
        nodeKey,
        window.setTimeout(() => {
          setShakingNodes((prev) => {
            if (!prev.has(nodeKey)) return prev;
            const next = new Set(prev);
            next.delete(nodeKey);
            return next;
          });
          nodeHitTimers.current.delete(nodeKey);
        }, 380),
      );
    }, delayMs + PULSE_DURATION_MS * 0.85);
  }

  useEffect(() => {
    fetchTopology()
      .then((topo) => {
        setSources(topo.sources);
        setTargets(topo.targets);
        setSubscriptions(topo.subscriptions);
        setSummary(topo.summary);
        setDlqNextRunAt(new Date(topo.dlqSchedule.nextRunAt).getTime());
      })
      .catch(() => setLoadError("Couldn't load relayhub-java's topology (sources/targets/subscriptions)."));
  }, []);

  /**
   * Re-fetch the DLQ count and next-sweep time shortly after anything that
   * could change them (a fresh dlq arrival, or a replay that just succeeded
   * and left the queue) — debounced so a burst of SSE events triggers one
   * request pair, not one per event. Never called for a replay that fails
   * again: the delivery was already DEAD and stays DEAD, so nothing changed.
   */
  function scheduleSummaryRefetch() {
    if (summaryRefetchTimer.current !== null) window.clearTimeout(summaryRefetchTimer.current);
    summaryRefetchTimer.current = window.setTimeout(() => {
      fetchDeliverySummary()
        .then((s) => setSummary(s))
        .catch(() => {});
      fetchDlqSchedule()
        .then((schedule) => setDlqNextRunAt(new Date(schedule.nextRunAt).getTime()))
        .catch(() => {});
    }, 600);
  }

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (dlqNextRunAt === undefined) return;
      const secondsLeft = Math.max(0, Math.ceil((dlqNextRunAt - Date.now()) / 1000));
      setDlqSecondsLeft(secondsLeft);
      if (secondsLeft === 0 && !resyncScheduledRef.current) {
        resyncScheduledRef.current = true;
        window.setTimeout(() => {
          fetchDlqSchedule()
            .then((schedule) => setDlqNextRunAt(new Date(schedule.nextRunAt).getTime()))
            .catch(() => {})
            .finally(() => {
              resyncScheduledRef.current = false;
            });
        }, 1200);
      }
    }, 1000);
    return () => window.clearInterval(tick);
  }, [dlqNextRunAt]);

  const sourcePositions = useMemo(() => {
    const positions = layout(sources.length, NODE_X_SOURCE);
    return Object.fromEntries(sources.map((s, i) => [s.key, positions[i]]));
  }, [sources]);

  const eventNodes = useMemo<EventNode[]>(() => {
    const seen = new Map<string, EventNode>();
    subscriptions.forEach((s) => {
      const key = eventNodeKey(s.sourceKey, s.sourceEventKey);
      if (!seen.has(key)) seen.set(key, { key, sourceKey: s.sourceKey, eventKey: s.sourceEventKey });
    });
    return Array.from(seen.values());
  }, [subscriptions]);

  const eventPositions = useMemo(() => {
    const positions = layout(eventNodes.length, NODE_X_EVENT);
    return Object.fromEntries(eventNodes.map((n, i) => [n.key, positions[i]]));
  }, [eventNodes]);

  const targetPositions = useMemo(() => {
    const positions = layout(targets.length, NODE_X_TARGET);
    return Object.fromEntries(targets.map((t, i) => [t.key, positions[i]]));
  }, [targets]);

  const rowCount = Math.max(sources.length, eventNodes.length, targets.length, 1);
  const hub: Point = useMemo(
    () => ({ x: HUB_X, y: TOP_MARGIN + ((rowCount - 1) * ROW_HEIGHT) / 2 }),
    [rowCount],
  );
  const dlqPos: Point = useMemo(
    () => ({ x: HUB_X, y: TOP_MARGIN + rowCount * ROW_HEIGHT }),
    [rowCount],
  );
  const svgHeight = TOP_MARGIN * 2 + rowCount * ROW_HEIGHT + 16;

  function tick() {
    // Only ever invoked from a requestAnimationFrame callback (never during
    // render), so reading the clock here is safe despite the rule's
    // conservative, call-site-agnostic check.
    // eslint-disable-next-line react-hooks/purity -- see comment above
    const now = performance.now();
    pulsesRef.current = pulsesRef.current.filter((p) => now - p.start < PULSE_DURATION_MS);
    setRenderedPulses(
      pulsesRef.current.map((p) => ({
        ...p,
        progress: Math.min((now - p.start) / PULSE_DURATION_MS, 1),
      })),
    );
    rafRef.current = pulsesRef.current.length > 0 ? requestAnimationFrame(tick) : null;
  }

  function spawnPulse(waypoints: Point[], color: string, replay = false) {
    const arcs = waypoints.slice(1).map(() => (Math.random() - 0.5) * 50);
    const lengths = waypoints
      .slice(1)
      .map((to, i) => Math.hypot(to.x - waypoints[i].x, to.y - waypoints[i].y) || 1);
    const totalLength = lengths.reduce((a, b) => a + b, 0);
    const legWeights = lengths.map((len) => len / totalLength);
    pulsesRef.current = [
      ...pulsesRef.current,
      { id: pulseId.current++, waypoints, arcs, legWeights, color, start: performance.now(), replay },
    ];
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return openLiveActivityStream(
      (event) => {
        setFeed((prev) => [event, ...prev].slice(0, 15));

        const ingressKey = event.eventKey ? eventNodeKey(event.sourceKey, event.eventKey) : event.sourceKey;
        const eventPos = event.eventKey ? eventPositions[eventNodeKey(event.sourceKey, event.eventKey)] : undefined;
        const color =
          event.status === "failed" ? COLOR_FAILED : event.status === "success" ? COLOR_SUCCESS : COLOR_INGRESS;
        const now = performance.now();

        if (event.stage === "ingress") {
          const from = sourcePositions[event.sourceKey];
          if (!from) return;
          const delay = readyDelay(lastIngressAt.current, ingressKey, now);
          lastIngressAt.current.set(ingressKey, now + delay + PULSE_DURATION_MS);
          const spawn = () => spawnPulse([from, eventPos ?? hub], color);
          if (delay > 0) window.setTimeout(spawn, delay);
          else spawn();
          triggerNodeHit(`evt:${ingressKey}`, delay);
        } else if (event.stage === "delivery") {
          const to = event.targetKey ? targetPositions[event.targetKey] : null;
          if (!to) return;
          const deliveryKey = `${ingressKey}:${event.targetKey}`;
          const delay = Math.max(
            readyDelay(lastIngressAt.current, ingressKey, now),
            readyDelay(lastDeliveryAt.current, deliveryKey, now),
          );
          lastDeliveryAt.current.set(deliveryKey, now + delay + PULSE_DURATION_MS);
          const spawn = () => spawnPulse([eventPos ?? hub, hub, to], color, event.replay);
          if (delay > 0) window.setTimeout(spawn, delay);
          else spawn();
          triggerNodeHit(`tgt:${event.targetKey}`, delay);
          if (event.status === "failed") triggerShake(delay);
          // Only a replay that *succeeded* actually changed the DLQ count (it
          // just left the queue) — a replay that failed again was already
          // DEAD and stays DEAD.
          if (event.replay && event.status === "success") scheduleSummaryRefetch();
        } else if (event.stage === "dlq") {
          const deliveryKey = `${ingressKey}:${event.targetKey}`;
          const delay = readyDelay(lastDeliveryAt.current, deliveryKey, now);
          lastDeliveryAt.current.set(deliveryKey, now + delay + PULSE_DURATION_MS);
          const spawn = () => spawnPulse([hub, dlqPos], DLQ_COLOR);
          if (delay > 0) window.setTimeout(spawn, delay);
          else spawn();
          triggerNodeHit("dlq", delay);
          triggerShake(delay);
          scheduleSummaryRefetch();
        }
      },
      setConnected,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePositions, eventPositions, targetPositions, hub, dlqPos]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="live-title text-xl font-bold sm:text-2xl">relayhub-java — Live Activity</h2>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-xs ${
            connected
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-border text-muted"
          }`}
        >
          {connected ? "● connected" : "connecting…"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Real Source → Source Event → RelayHub → Target traffic, pushed over SSE from the real
        deployed service the instant it happens — not a simulation, not polling.
        relayhub-demo-systems generates the underlying flight events continuously.
      </p>

      {loadError ? (
        <p className="mt-4 text-sm text-muted">{loadError}</p>
      ) : (
        <div className={`topology-card mt-4 rounded-lg border border-border ${shaking ? "topology-shake" : ""}`}>
          <svg
            viewBox={`0 0 840 ${svgHeight}`}
            width="100%"
            height={Math.min(svgHeight, 420)}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Live event topology animation"
          >
            {sources.map((s) => {
              const pos = sourcePositions[s.key];
              if (!pos) return null;
              return (
                <Fragment key={s.key}>
                  <rect
                    x={pos.x - NODE_WIDTH_SOURCE / 2}
                    y={pos.y - NODE_HEIGHT / 2}
                    width={NODE_WIDTH_SOURCE}
                    height={NODE_HEIGHT}
                    rx={8}
                    className="topology-node topology-node-source"
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="topology-label">
                    {s.key}
                  </text>
                </Fragment>
              );
            })}

            {eventNodes.map((n) => {
              const sourcePos = sourcePositions[n.sourceKey];
              const pos = eventPositions[n.key];
              if (!sourcePos || !pos) return null;
              return (
                <Fragment key={`e-${n.key}`}>
                  <line
                    x1={sourcePos.x + NODE_WIDTH_SOURCE / 2}
                    y1={sourcePos.y}
                    x2={pos.x - NODE_WIDTH_EVENT / 2}
                    y2={pos.y}
                    className="topology-edge"
                  />
                  <line
                    x1={pos.x + NODE_WIDTH_EVENT / 2}
                    y1={pos.y}
                    x2={hub.x - 56}
                    y2={hub.y}
                    className="topology-edge"
                  />
                  <rect
                    x={pos.x - NODE_WIDTH_EVENT / 2}
                    y={pos.y - NODE_HEIGHT / 2}
                    width={NODE_WIDTH_EVENT}
                    height={NODE_HEIGHT}
                    rx={8}
                    className={`topology-node topology-node-event${shakingNodes.has(`evt:${n.key}`) ? " topology-node-hit" : ""}`}
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="topology-label">
                    {n.eventKey}
                  </text>
                </Fragment>
              );
            })}

            {targets.map((t) => {
              const pos = targetPositions[t.key];
              if (!pos) return null;
              return (
                <Fragment key={t.key}>
                  <line x1={hub.x + 56} y1={hub.y} x2={pos.x - NODE_WIDTH_TARGET / 2} y2={pos.y} className="topology-edge" />
                  <rect
                    x={pos.x - NODE_WIDTH_TARGET / 2}
                    y={pos.y - NODE_HEIGHT / 2}
                    width={NODE_WIDTH_TARGET}
                    height={NODE_HEIGHT}
                    rx={8}
                    className={`topology-node topology-node-target${shakingNodes.has(`tgt:${t.key}`) ? " topology-node-hit" : ""}`}
                  />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="topology-label">
                    {t.key}
                  </text>
                </Fragment>
              );
            })}

            <line x1={hub.x} y1={hub.y + 20} x2={dlqPos.x} y2={dlqPos.y - NODE_HEIGHT / 2} className="topology-edge topology-edge-dlq" />

            {renderedPulses.map((p) => {
              const { x, y, angleDeg } = pointOnPath(p, p.progress);
              const opacity = p.progress > 0.85 ? 1 - (p.progress - 0.85) / 0.15 : 1;
              const trail = TRAIL_OFFSETS.map((back) => pointOnPath(p, Math.max(p.progress - back, 0)));
              const launchT = Math.min(p.progress / 0.18, 1);
              const impactT = p.progress > 0.8 ? (p.progress - 0.8) / 0.2 : 0;
              const start = p.waypoints[0];
              const end = p.waypoints[p.waypoints.length - 1];
              const explosion = EXPLOSION_PRESETS[explosionKind(p.color)];
              const s = MISSILE_SCALE;
              return (
                <g key={p.id}>
                  {launchT < 1 && (
                    <circle
                      cx={start.x}
                      cy={start.y}
                      r={4 + launchT * 20}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={2.5}
                      opacity={(1 - launchT) * 0.6}
                    />
                  )}
                  {impactT > 0 && (
                    <g>
                      <circle
                        cx={end.x}
                        cy={end.y}
                        r={5 + impactT * explosion.ring}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={3}
                        opacity={(1 - impactT) * 0.85}
                      />
                      <circle
                        cx={end.x}
                        cy={end.y}
                        r={Math.max(0, 14 - impactT * 14)}
                        fill="#fff"
                        opacity={(1 - impactT) * (impactT < 0.4 ? (Math.sin(impactT * 70) > 0 ? 1 : 0.35) : 0.9)}
                      />
                      {IMPACT_TEXT[explosionKind(p.color)] && impactT < 0.75 && (
                        <text
                          x={end.x}
                          y={end.y - 20 - impactT * 24}
                          textAnchor="middle"
                          className="topology-impact-text"
                          style={{
                            fill: p.color,
                            opacity: impactT < 0.15 ? impactT / 0.15 : 1 - (impactT - 0.15) / 0.6,
                          }}
                        >
                          {IMPACT_TEXT[explosionKind(p.color)]}
                        </text>
                      )}
                      {Array.from({ length: explosion.count }).map((_, i) => {
                        const angle = (i / explosion.count) * Math.PI * 2 + p.id * 0.37;
                        const jitter = ((p.id * 13 + i * 7) % 10) / 10;
                        const dist = impactT * explosion.distance * (0.7 + jitter * 0.5);
                        const px = end.x + Math.cos(angle) * dist;
                        const py = end.y + Math.sin(angle) * dist;
                        const particleColor = explosion.colors[i % explosion.colors.length];
                        return (
                          <circle
                            key={i}
                            cx={px}
                            cy={py}
                            r={Math.max(0, (i % 3 === 0 ? 4 : 2.2) * (1 - impactT))}
                            fill={particleColor}
                            opacity={1 - impactT}
                          />
                        );
                      })}
                    </g>
                  )}
                  <g opacity={opacity}>
                    {trail.map((t, i) => (
                      <circle
                        key={i}
                        cx={t.x}
                        cy={t.y}
                        r={PULSE_RADIUS * (0.78 - i * 0.1)}
                        fill={i < TRAIL_COLORS.length ? TRAIL_COLORS[i] : p.color}
                        opacity={0.6 - i * 0.08}
                      />
                    ))}
                    <g
                      className="topology-missile"
                      style={{ color: p.color }}
                      transform={`translate(${x} ${y}) rotate(${angleDeg})`}
                    >
                      {p.replay && (
                        <circle cx={0} cy={0} r={12 * s} fill="none" stroke={p.color} strokeWidth={1.5} strokeDasharray="3 2" />
                      )}
                      <ellipse cx={0} cy={0} rx={9 * s} ry={5 * s} fill={p.color} />
                      <path d={`M ${7 * s},${-4 * s} L ${13 * s},0 L ${7 * s},${4 * s} Z`} fill={p.color} />
                      <circle cx={1.5 * s} cy={0} r={2 * s} fill="#fff" opacity={0.9} />
                    </g>
                  </g>
                </g>
              );
            })}

            {/*
             * Hub + DLQ nodes render last (on top of pulses) so their labels
             * stay legible even while a missile is passing directly through
             * them — pulses fly "through" these waypoints by design, but a
             * label getting garbled mid-flight reads as a rendering bug.
             */}
            <rect
              x={hub.x - 52}
              y={hub.y - 20}
              width={104}
              height={40}
              rx={10}
              className="topology-hub"
            />
            <text x={hub.x} y={hub.y + 4} textAnchor="middle" className="topology-hub-label">
              RelayHub
            </text>

            <rect
              x={dlqPos.x - NODE_WIDTH_DLQ / 2}
              y={dlqPos.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH_DLQ}
              height={NODE_HEIGHT}
              rx={8}
              className={`topology-node topology-node-dlq${shakingNodes.has("dlq") ? " topology-node-hit" : ""}`}
            />
            <text x={dlqPos.x} y={dlqPos.y + 4} textAnchor="middle" className="topology-label topology-label-dlq">
              DLQ{summary ? ` (${summary.dead})` : ""}
            </text>
            {dlqSecondsLeft !== undefined && (
              <text x={dlqPos.x} y={dlqPos.y + NODE_HEIGHT / 2 + 14} textAnchor="middle" className="topology-label-dlq-timer">
                auto-replay in {dlqSecondsLeft}s
              </text>
            )}
          </svg>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Recent activity</h3>
        <div className="mt-2 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Target</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">At</th>
              </tr>
            </thead>
            <tbody>
              {feed.map((e, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    {e.stage}
                    {e.replay ? <span className="ml-1 text-xs text-amber-400">(replay)</span> : null}
                  </td>
                  <td className="px-3 py-2 text-muted">{e.sourceKey}</td>
                  <td className="px-3 py-2 text-muted">{e.targetKey ?? "–"}</td>
                  <td className="px-3 py-2">
                    {e.status ? (
                      <span
                        className={
                          e.status === "success"
                            ? "text-emerald-400"
                            : e.status === "dead"
                              ? "text-muted"
                              : "text-red-400"
                        }
                      >
                        {e.status}
                      </span>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted">{new Date(e.at).toLocaleTimeString()}</td>
                </tr>
              ))}
              {feed.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-muted">
                    Waiting for activity…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
