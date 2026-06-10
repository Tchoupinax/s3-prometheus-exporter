import { _Object } from "@aws-sdk/client-s3";

import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor() {
    super("connection_health", "global");
  }

  declarePrometheusMesure(register: Registry): Gauge<string> {
    return new Gauge({
      name: this.name(),
      help: "S3 connection health (1 = ok, 0 = authentication failed)",
      registers: [register],
    });
  }

  process(_files: _Object[]): number {
    return 1;
  }
}
