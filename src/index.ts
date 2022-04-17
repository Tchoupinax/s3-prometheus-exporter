import Fastify, { FastifyReply } from 'fastify'
import { Registry } from 'prom-client'
import * as fs from 'fs'
import Metric from './metrics/metric';
import logger from './utils/logger';
import queryS3 from './queryS3'
import * as config from 'config';

// let plugins: InstanceType<typeof Metric>[] = [];
let plugins: any = []
const register = new Registry();
const prefixes = (config.get('prefixes') as string).split(',') ?? ['default']

const pluginsFileNames = fs.readdirSync('src/metrics')
  .filter(name => name !== 'metric.ts');

for (let j = 0; j < prefixes.length; j++) {
  plugins = [
    ...plugins,
    ...(await Promise.all(
      pluginsFileNames.map(async filename => {
        const { default: localClass } = await import(`${process.cwd()}/src/metrics/${filename}`)

        return (new localClass(prefixes[j])) as InstanceType<typeof Metric>
      })))
  ];

  for (let i = 0; i < pluginsFileNames.length; i++) {
    plugins[i + (j * pluginsFileNames.length)].saveMesure(plugins[i + (j * pluginsFileNames.length)].declarePrometheusMesure(register));
  }
}

const app = Fastify();

app.get('/metrics', async (_, reply: FastifyReply) => {
  reply.header('Content-Type', register.contentType)

  await queryS3(plugins);

  return reply.send(await register.metrics());
});

app.listen(6004, () => {
  logger.info('Server is started on port %s', 6004)
});
