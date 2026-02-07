import { _Object } from "@aws-sdk/client-s3";

import { Gauge, Registry } from "prom-client";

import { Metric } from "./../metric";

export default class extends Metric {
  constructor() {
    super("global_files_count", "global");
  }

  declarePrometheusMesure(register: Registry): Gauge<string> {
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
