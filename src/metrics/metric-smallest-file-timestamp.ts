import { Gauge, Registry } from "prom-client";
import { S3Object } from "../types/S3Object";

import Metric from "./metric"

export default class extends Metric {
  constructor(prefix: string) {
    super('smallest_file_timestamp');

    this.prefix = prefix;
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: 'Last modified timestamp(milliseconds) for latest file in',
      labelNames: ['name'],
      registers: [register],
    });
  }

  process(files: S3Object[]): number {
    return files.reduce((acc: number, cur: S3Object) => {
      if (acc < cur.Size) {
        return cur.Size
      } else {
        return acc
      }

    }, 0)
  }
}
