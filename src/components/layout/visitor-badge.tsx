"use client";

import { useEffect, useState } from "react";
import { fetchAllTimeCount, fetchTodayCount, recordVisit } from "@/lib/visitor-counter";

export function VisitorBadge() {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [allTimeCount, setAllTimeCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await recordVisit();
      const [today, allTime] = await Promise.all([fetchTodayCount(), fetchAllTimeCount()]);
      if (!cancelled) {
        setTodayCount(today);
        setAllTimeCount(allTime);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (todayCount === null && allTimeCount === null) return null;

  return (
    <span
      className="font-mono text-[11px] text-muted/70"
      title="Visitor count: today · all-time"
      aria-label="Visitor count"
    >
      {todayCount !== null && <>{todayCount} today</>}
      {todayCount !== null && allTimeCount !== null && " · "}
      {allTimeCount !== null && <>{allTimeCount} all-time</>}
    </span>
  );
}
