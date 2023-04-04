import { _Object } from "@aws-sdk/client-s3";
import { Gauge, Registry } from "prom-client";

import Metric from "./metric";

export default class extends Metric {
  constructor (prefix: string) {
    super("smallest_file_timestamp");
    this.prefix = prefix;
  }

  declarePrometheusMesure (register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Last modified timestamp(milliseconds) for latest file in",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process (files: Array<_Object>): number {
    return files.reduce((acc: number, cur: _Object) => {
      if (cur.Size && acc < cur.Size) {
        return cur.Size ?? 0;
      } else {
        return acc;
      }
    }, 0);
  }
}
