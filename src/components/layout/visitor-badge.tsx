"use client";

import { useEffect, useState } from "react";
import { fetchTodayCount, recordVisitOnce } from "@/lib/visitor-counter";

export function VisitorBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await recordVisitOnce();
      const value = await fetchTodayCount();
      if (!cancelled) setCount(value);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <span className="text-xs text-muted" aria-label="Today's visitor count">
      Today · {count}
    </span>
  );
}
