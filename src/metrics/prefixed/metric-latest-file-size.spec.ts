import { _Object } from "@aws-sdk/client-s3";

import { beforeEach, describe, expect, it } from "vitest";

import MetricLatestFileSize from "./metric-latest-file-size";

describe("metric latest file size", () => {
  let metricLatestFileSize: MetricLatestFileSize;

  beforeEach(() => {
    metricLatestFileSize = new MetricLatestFileSize("test");
  });

  it("should return the name of the metric", () => {
    expect(metricLatestFileSize.name()).toBe("s3_latest_file_size_test");
  });

  it("should return the size of the latest file (sorted by timestamp)", () => {
    const data: Array<_Object> = [
      { Size: 23, LastModified: new Date("December 17, 1992") },
      { Size: 1234, LastModified: new Date("December 17, 1998") },
      { Size: 2345, LastModified: new Date("December 17, 1995") },
    ];

    const answer = metricLatestFileSize.process(data);

    expect(answer).toBe(1234);
  });

  it("should return the size of the latest file (sorted by timestamp)", () => {
    const data: Array<_Object> = [
      { Size: 23, LastModified: new Date("December 17, 1992") },
      { Size: 1234, LastModified: new Date("December 17, 1988") },
      { Size: 2345, LastModified: new Date("December 17, 1995") },
    ];

    const answer = metricLatestFileSize.process(data);

    expect(answer).toBe(2345);
  });
});
