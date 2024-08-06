import config from "config";
import pino from "pino";
import pretty from "pino-pretty";

let logger: pino.Logger;

if (config.get("logger.pretty")) {
  logger = pino(
    {
      level: config.get("logger.level"),
      base: null,
    },
    pretty({
      colorize: true,
      levelFirst: true,
      translateTime: "HH:MM:ss.l",
    }),
  );
} else {
  logger = pino({
    level: config.get("logger.level"),
    base: null,
  });
}

export default logger;
