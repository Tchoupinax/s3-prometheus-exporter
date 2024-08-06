import { _Object } from "@aws-sdk/client-s3";
import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor(prefix: string) {
    super("files_count", prefix);
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Count of files in the bucket",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process(files: _Object[]): number {
    return files.length;
  }
}
