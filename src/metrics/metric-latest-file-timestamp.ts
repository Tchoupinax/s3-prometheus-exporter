import { Gauge, Registry } from "prom-client";
import { S3Object } from "../types/S3Object";

import Metric from "./metric"

export default class extends Metric {
  constructor(prefix: string) {
    super('latest_file_timestamp');

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
      if (acc < new Date(cur.LastModified).getTime()) {
        return new Date(cur.LastModified).getTime()
      } else {
        return acc
      }

    }, new Date('1970-01-01').getTime()) / 1000
  }
}
