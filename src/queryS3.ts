import {
  _Object,
  ListObjectsCommand,
  ListObjectsCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

import config from "config";

import { Metric } from "./metrics/metric";
import { isValidRegex } from "./utils/is-valid-regex";
import { logger } from "./utils/logger";

const prefixes = (config.get("prefixes") as string).split(",") ?? ["default"];

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.get("accessKey"),
    secretAccessKey: config.get("secretKey"),
  },
  endpoint: config.get("endpoint"),
  region: config.get("region"),
});

export default async function (
  labelledPlugins: InstanceType<typeof Metric>[],
  globalPlugins: InstanceType<typeof Metric>[],
): Promise<void> {
  const files = await listAllContents({ Bucket: config.get("bucket") });

  for (let i = 0; i < labelledPlugins.length; i++) {
    for (const prefix of prefixes) {
      if (isValidRegex(prefix)) {
        const backupNamesByRegex = Array.from(
          new Set(
            files
              .map((f) => f.Key)
              .map((key) => key?.match(prefix))
              .filter((e) => e)
              .map((e) => e?.[1]),
          ),
        );

        for (const name of backupNamesByRegex) {
          if (name) {
            labelledPlugins[i]
              .getMesure()
              .labels(name)
              .set(
                labelledPlugins[i].process(
                  files.filter((file) => file.Key?.match(name)),
                ),
              );
          }
        }
      } else {
        labelledPlugins[i]
          .getMesure()
          .labels(prefix)
          .set(
            labelledPlugins[i].process(
              files.filter((file) => file.Key?.includes(prefix)),
            ),
          );
      }
    }
  }

  for (let i = 0; i < globalPlugins.length; i++) {
    globalPlugins[i].getMesure().set(globalPlugins[i].process(files));
  }
}

async function listAllContents({
  Bucket,
  Prefix,
}: {
  Bucket: string;
  Prefix?: string;
}): Promise<_Object[]> {
  let list: Array<_Object> = [];
  let shouldContinue = true;
  let cursor: string | undefined;

  while (shouldContinue) {
    const params: ListObjectsCommandInput = {
      Bucket,
      Prefix,
    };
    if (cursor) {
      params.Marker = cursor;
    }

    const res = await s3Client.send(new ListObjectsCommand(params));

    if (res.Contents) {
      list = [...list, ...res.Contents];
    }

    if (!res.IsTruncated) {
      shouldContinue = false;
      cursor = undefined;
    } else {
      cursor = list.at(-1)?.Key;
    }
  }

  logger.debug("Processing %s objects", list.length);

  return list;
}
