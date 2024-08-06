import { _Object } from "@aws-sdk/client-s3";
import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor(prefix: string) {
    super("biggest_file_size", prefix);
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Biggest file size",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process(files: _Object[]): number {
    return files.reduce((acc: number, cur: _Object) => {
      if (cur.Size && acc < cur.Size) {
        return cur.Size;
      } else {
        return acc;
      }
    }, 0);
  }
}
