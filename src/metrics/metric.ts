import { _Object } from "@aws-sdk/client-s3";
import { Gauge, Registry } from "prom-client";

export default abstract class Metric {
  public metricName: string;
  private mesure?: Gauge<"mesure"> = undefined;
  protected prefix: string;

  constructor (name: string, prefix: string) {
    this.metricName = name;
    this.prefix = prefix;
  }

  saveMesure (mesure: Gauge<"mesure">): void {
    this.mesure = mesure;
  }

  getMesure (): Gauge<"mesure"> {
    return this.mesure!;
  }

  name (): string {
    return `s3_${this.metricName}_${this.prefix}`;
  }

  getPrefix (): string {
    return this.prefix;
  }

  abstract declarePrometheusMesure(register: Registry): Gauge<"mesure">
  abstract process(files: _Object[]): number;
}
