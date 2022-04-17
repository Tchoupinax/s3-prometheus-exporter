import { Gauge, Registry } from 'prom-client'

export default abstract class Metric {
  public metricName: string;
  private mesure?: Gauge<any> = undefined;
  protected prefix?: string;

  constructor (name: string) {
    this.metricName = name;
  }

  saveMesure(mesure: Gauge<any>) { this.mesure = mesure; }
  getMesure(): Gauge<any> { return this.mesure!; }
  name() { return `s3_${this.metricName}_${this.prefix}` };

  abstract declarePrometheusMesure(register: Registry): Gauge<any>
  abstract process(files: S3Object[]): number;
}
