import { readdirSync } from "node:fs";

import config from "config";
import Fastify, { type FastifyReply } from "fastify";
import { Registry } from "prom-client";

import type { Metric } from "./metrics/metric.mjs";
import queryS3 from "./queryS3.mjs";
import { logger } from "./utils/logger.mjs";
import { isS3CredentialsError, setConnectionHealth } from "./utils/s3-credentials-error.mjs";

type MetricConstructor = new () => InstanceType<typeof Metric>;

const METRIC_EXTENSIONS = [".mjs", ".mts"] as const;

function isMetricModule(filename: string): boolean {
  return METRIC_EXTENSIONS.some(extension => filename.endsWith(extension)) &&
    !filename.includes("metric.") &&
    !filename.includes("spec");
}

function listMetricModules(directory: string): string[] {
  return readdirSync(new URL(directory, import.meta.url)).filter(isMetricModule);
}

async function instantiateMetric(directory: string, filename: string): Promise<InstanceType<typeof Metric>> {
  const { default: LocalClass } = await import(new URL(`${directory}/${filename}`, import.meta.url).href) as {
    default: MetricConstructor;
  };

  return new LocalClass();
}

const register = new Registry();
const prefixedPluginsFileNames = listMetricModules("./metrics/prefixed");
const globalPluginsFileNames = listMetricModules("./metrics/global");

const labelledPlugins = await Promise.all(
  prefixedPluginsFileNames.map(filename => instantiateMetric("./metrics/prefixed", filename)),
);

for (const plugin of labelledPlugins) {
  plugin.saveMesure(plugin.declarePrometheusMesure(register));
}

const globalPlugins = await Promise.all(
  globalPluginsFileNames.map(filename => instantiateMetric("./metrics/global", filename)),
);

for (const plugin of globalPlugins) {
  plugin.saveMesure(plugin.declarePrometheusMesure(register));
}

const app = Fastify();

app.get("/metrics", async (_, reply: FastifyReply) => {
  logger.debug("Request received");

  try {
    await queryS3(labelledPlugins, globalPlugins);

    reply.header("Content-Type", register.contentType);

    return reply.send(await register.metrics());
  } catch (err) {
    if (isS3CredentialsError(err)) {
      setConnectionHealth(globalPlugins, 0);
      logger.warn(err, "S3 credentials rejected, s3_connection_health=0");
      reply.header("Content-Type", register.contentType);
      return reply.send(await register.metrics());
    }

    logger.error(err);
    return reply.status(500).send("Internal error, please give a look to logs.\n");
  }
});

await app.listen({ port: config.get("port"), host: "0.0.0.0" });
logger.info("Server is started on port %s", config.get("port"));
