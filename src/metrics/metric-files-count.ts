import { Gauge, Registry } from "prom-client";
import { S3Object } from "../types/S3Object";

import Metric from "./metric"

export default class extends Metric {
  constructor(prefix: string) {
    super('file_count');

    this.prefix = prefix;
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: 'Count of files in the bucket',
      labelNames: ['name'],
      registers: [register],
    });
  }

  process(files: S3Object[]): number {
    if (this.prefix !== undefined) {
      return files.filter(file => file.Key.includes(this.prefix!)).length
    }

    return files.length;
  }
}
