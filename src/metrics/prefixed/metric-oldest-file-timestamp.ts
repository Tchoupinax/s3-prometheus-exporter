import { _Object } from "@aws-sdk/client-s3";

import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor(prefix: string) {
    super("oldest_file_timestamp", prefix);
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Last modified timestamp(milliseconds) for oldest file in",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process(files: _Object[]): number {
    if (files.length === 0) {
      return 0;
    }

    return (
      files.reduce((acc: number, cur: _Object) => {
        if (cur.LastModified && acc > new Date(cur.LastModified).getTime()) {
          return new Date(cur.LastModified).getTime();
        } else {
          return acc;
        }
      }, new Date().getTime()) / 1000
    );
  }
}
