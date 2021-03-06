import { Gauge } from "prom-client";
import { describe, beforeAll, it, expect } from "vitest";
import Metric from './metric';

class TestMetric extends Metric {
  constructor(prefix: string) {
    super('smallest_file_timestamp');

    this.prefix = prefix;
  }
  
  declarePrometheusMesure(): Gauge<any> {
    throw new Error("Method not implemented.");
  }

  process(): number {
    throw new Error("Method not implemented.");
  }
}

describe('metric', () => {
  let metric: InstanceType<typeof Metric>;

  beforeAll(() => {
    metric = new TestMetric("test-01")
  })

  it('should process the name correctly', () => {
    expect(metric.name()).toBe("s3_test-01_undefined");
  })
})