import { _Object } from "@aws-sdk/client-s3";

import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor() {
    super("global_bucket_size", "global");
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Size of the bucket (in Bytes)",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process(files: _Object[]): number {
    return files.reduce((acc: number, cur: _Object) => {
      return cur.Size! + acc;
    }, 0);
  }
}
