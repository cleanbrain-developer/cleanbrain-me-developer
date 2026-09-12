// Client for the shared cleanbrain-me-visitor-counter service. This app is
// a static export with no server runtime (ADR-0003), so this is a plain
// external fetch from the browser, not anything server-side.
const BASE_URL =
  process.env.NEXT_PUBLIC_VISITOR_COUNTER_URL ?? "https://visitor-counter.cleanbrain.me";
const SERVICE_ID = "developer";
const SESSION_PING_KEY = "cleanbrain-visitor-pinged";

function clientTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function recordVisitOnce(): Promise<void> {
  try {
    if (sessionStorage.getItem(SESSION_PING_KEY)) return;
    sessionStorage.setItem(SESSION_PING_KEY, "1");
  } catch {
    // sessionStorage unavailable -- fall through and ping anyway.
  }

  try {
    await fetch(`${BASE_URL}/v1/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service: SERVICE_ID }),
    });
  } catch {
    // Counter being unreachable must never affect the page itself.
  }
}

export async function fetchTodayCount(): Promise<number | null> {
  try {
    const tz = encodeURIComponent(clientTimeZone());
    const res = await fetch(`${BASE_URL}/v1/visits/today?service=${SERVICE_ID}&tz=${tz}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { count: number };
    return data.count;
  } catch {
    return null;
  }
}
