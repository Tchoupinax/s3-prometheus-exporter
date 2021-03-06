import { Gauge, Registry } from 'prom-client'
import { S3Object } from '../types/S3Object';

export default abstract class Metric {
  public metricName: string;
  private mesure?: Gauge<any> = undefined;
  protected prefix?: string;

  constructor (name: string) {
    this.metricName = name;
  }

  saveMesure(mesure: Gauge<any>) { this.mesure = mesure; }
  getMesure(): Gauge<any> { return this.mesure!; }
  name() { return `s3_${this.metricName}_${this.prefix}` }
  getPrefix(): string { return this.prefix! }

  abstract declarePrometheusMesure(register: Registry): Gauge<any>
  abstract process(files: S3Object[]): number;
}
