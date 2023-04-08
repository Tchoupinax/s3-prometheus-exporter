import { Gauge } from "prom-client";
import { beforeAll, describe, expect, it } from "vitest";

import Metric from "./metric";

class TestMetric extends Metric {
  constructor (prefix: string) {
    super("smallest_file_timestamp", prefix);
  }

  declarePrometheusMesure (): Gauge<any> {
    throw new Error("Method not implemented.");
  }

  process (): number {
    throw new Error("Method not implemented.");
  }
}

describe("metric", () => {
  let metric: InstanceType<typeof Metric>;

  beforeAll(() => {
    metric = new TestMetric("test-01");
  });

  it("should process the name correctly", () => {
    expect(metric.name()).toBe("s3_smallest_file_timestamp_test-01");
  });
});
