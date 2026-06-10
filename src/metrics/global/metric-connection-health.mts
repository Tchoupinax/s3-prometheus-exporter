import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric.mjs";

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

  process(): number {
    return 1;
  }
}
