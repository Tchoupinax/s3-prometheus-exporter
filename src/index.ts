import { readdirSync } from "node:fs";
import path from "node:path";

import config from "config";
import Fastify, { FastifyReply } from "fastify";
import { Registry } from "prom-client";

import { Metric } from "./metrics/metric";
import queryS3 from "./queryS3";
import { logger } from "./utils/logger";

let globalPlugins: InstanceType<typeof Metric>[] = [];
let labelledPlugins: InstanceType<typeof Metric>[] = [];
const register = new Registry();

const prefixedPluginsFileNames = readdirSync(
  path.join(__dirname, "/metrics/prefixed"),
)
  .filter((name) => !name.includes("metric."))
  .filter((name) => !name.includes("spec"))
  .filter((name) => name.endsWith(".js") || name.endsWith(".ts"));

const globalPluginsFileNames = readdirSync(
  path.join(__dirname, "/metrics/global"),
)
  .filter((name) => !name.includes("metric."))
  .filter((name) => !name.includes("spec"))
  .filter((name) => name.endsWith(".js") || name.endsWith(".ts"));

async function main(): Promise<void> {
  labelledPlugins = [
    ...labelledPlugins,
    ...(await Promise.all(
      prefixedPluginsFileNames.map(async (filename) => {
        const { default: LocalClass } = await import(
          path.join(__dirname, "metrics/prefixed", filename)
        );
        return new LocalClass() as InstanceType<typeof Metric>;
      }),
    )),
  ];

  for (let i = 0; i < prefixedPluginsFileNames.length; i++) {
    labelledPlugins[i].saveMesure(
      labelledPlugins[i].declarePrometheusMesure(register),
    );
  }

  globalPlugins = await Promise.all(
    globalPluginsFileNames.map(async (filename) => {
      const { default: LocalClass } = await import(
        path.join(__dirname, "metrics/global", filename)
      );
      return new LocalClass() as InstanceType<typeof Metric>;
    }),
  );

  for (let i = 0; i < globalPluginsFileNames.length; i++) {
    globalPlugins[i].saveMesure(
      globalPlugins[i].declarePrometheusMesure(register),
    );
  }

  const app = Fastify();
  app.get("/metrics", async (_, reply: FastifyReply) => {
    logger.info("Request received");
    reply.header("Content-Type", register.contentType);
    await queryS3(labelledPlugins, globalPlugins);
    return reply.send(await register.metrics());
  });

  app.listen({ port: config.get("port"), host: "0.0.0.0" }, () => {
    logger.info("Server is started on port %s", config.get("port"));
  });
}

main();
