import { describe, expect, it } from "vitest";
import {
  parseInstantValue,
  parseRangeSeries,
  type PrometheusInstantResult,
  type PrometheusRangeResult,
} from "@/lib/relayhub/live-observability";

// Fixtures below are real response shapes captured from
// relayhub-java.developer.cleanbrain.me's actual /api/metrics/query(_range)
// proxy (see ADR-0004) — not invented.

describe("parseInstantValue", () => {
  it("extracts the scalar value from a real instant-query response", () => {
    const body: PrometheusInstantResult = {
      data: { result: [{ value: [1789258794.656, "11.999999999999998"] }] },
    };
    expect(parseInstantValue(body)).toBeCloseTo(12, 1);
  });

  it("returns 0 when the query has no result (e.g. no matching metric yet)", () => {
    const body: PrometheusInstantResult = { data: { result: [] } };
    expect(parseInstantValue(body)).toBe(0);
  });

  it("returns 0 when data is entirely absent", () => {
    expect(parseInstantValue({})).toBe(0);
  });
});

describe("parseRangeSeries", () => {
  it("reshapes a multi-series range-query response, labeling by the metric's status", () => {
    const body: PrometheusRangeResult = {
      data: {
        result: [
          {
            metric: { status: "success" },
            values: [
              [1000, "5"],
              [1060, "7"],
            ],
          },
          {
            metric: { status: "failed" },
            values: [
              [1000, "1"],
              [1060, "2"],
            ],
          },
        ],
      },
    };

    const series = parseRangeSeries(body, (metric) => metric.status ?? "unknown");

    expect(series).toHaveLength(2);
    expect(series[0]).toEqual({
      label: "success",
      points: [
        { timestamp: 1000, value: 5 },
        { timestamp: 1060, value: 7 },
      ],
    });
    expect(series[1].label).toBe("failed");
  });

  it("falls back to a fixed label when the series carries no distinguishing metric labels", () => {
    const body: PrometheusRangeResult = {
      data: { result: [{ metric: {}, values: [[1000, "12"]] }] },
    };
    const series = parseRangeSeries(body, () => "events/min");
    expect(series).toEqual([{ label: "events/min", points: [{ timestamp: 1000, value: 12 }] }]);
  });

  it("returns an empty array when there is no data at all", () => {
    expect(parseRangeSeries({}, () => "x")).toEqual([]);
  });
});
