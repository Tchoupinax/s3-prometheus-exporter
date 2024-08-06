import { _Object } from "@aws-sdk/client-s3";
import { Gauge, Registry } from "prom-client";

import { Metric } from "../metric";

export default class extends Metric {
  constructor(prefix: string) {
    super("latest_file_size", prefix);
  }

  declarePrometheusMesure(register: Registry): Gauge<any> {
    return new Gauge({
      name: this.name(),
      help: "Most recent file size",
      labelNames: ["name"],
      registers: [register],
    });
  }

  process(files: Array<_Object>): number {
    let mostRecentFile: _Object = files[0];

    for (const file of files) {
      if (
        file?.LastModified &&
        mostRecentFile?.LastModified &&
        file?.LastModified > mostRecentFile?.LastModified
      ) {
        mostRecentFile = file;
      }
    }

    return mostRecentFile?.Size ?? -1;
  }
}
