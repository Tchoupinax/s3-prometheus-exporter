import { readdirSync } from "node:fs";
import path from "node:path";

import config from "config";
import Fastify, { FastifyReply } from "fastify";
import { Registry } from "prom-client";

import Metric from "./metrics/metric";
import queryS3 from "./queryS3";
import logger from "./utils/logger";

let plugins: InstanceType<typeof Metric>[] = [];
const register = new Registry();
const prefixes = (config.get("prefixes") as string).split(",") ?? ["default"];

const pluginsFileNames = readdirSync(path.join(__dirname, "/metrics"))
  .filter(name => !name.includes("metric."));

async function main (): Promise<void> {
  for (let j = 0; j < prefixes.length; j++) {
    plugins = [
      ...plugins,
      ...(await Promise.all(
        pluginsFileNames.map(async filename => {
          const { default: LocalClass } = await import(`${process.cwd()}/src/metrics/${filename}`);
          return (new LocalClass(prefixes[j])) as InstanceType<typeof Metric>;
        }))),
    ];

    for (let i = 0; i < pluginsFileNames.length; i++) {
      plugins[i + (j * pluginsFileNames.length)].saveMesure(plugins[i + (j * pluginsFileNames.length)].declarePrometheusMesure(register));
    }
  }

  const app = Fastify();
  app.get("/metrics", async (_, reply: FastifyReply) => {
    reply.header("Content-Type", register.contentType);
    await queryS3(plugins);
    return reply.send(await register.metrics());
  });

  app.listen(
    { port: config.get("port"), host: "0.0.0.0" },
    () => {
      logger.info("Server is started on port %s", config.get("port"));
    },
  );
}

main();
