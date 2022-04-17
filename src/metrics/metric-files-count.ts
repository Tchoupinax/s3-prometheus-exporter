import { Gauge, Registry } from "prom-client";

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
    return files.length;
  }
}
