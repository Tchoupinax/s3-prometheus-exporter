import config from "config";
import pino, { LoggerOptions } from "pino";

const options: LoggerOptions = {
  level: config.get("logger.level"),
  base: null,
};

if (process.env.NODE_ENV !== "production") {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "HH:MM:ss.l",
    },
  };
}

export const logger = pino(options);
