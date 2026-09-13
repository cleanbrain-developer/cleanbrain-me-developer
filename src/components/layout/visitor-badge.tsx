"use client";

import { useEffect, useState } from "react";
import { fetchAllTimeCount, fetchTodayCount, recordVisitOnce } from "@/lib/visitor-counter";

export function VisitorBadge() {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [allTimeCount, setAllTimeCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await recordVisitOnce();
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
    <span className="text-xs text-muted" aria-label="Visitor count">
      {todayCount !== null && <>Today · {todayCount}</>}
      {todayCount !== null && allTimeCount !== null && " · "}
      {allTimeCount !== null && <>All · {allTimeCount}</>}
    </span>
  );
}
