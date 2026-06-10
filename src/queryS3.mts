import {
  _Object,
  ListObjectsCommand,
  ListObjectsCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

import config from "config";

import { Metric } from "./metrics/metric.mjs";
import { isValidRegex } from "./utils/is-valid-regex.mjs";
import { logger } from "./utils/logger.mjs";
import {
  CONNECTION_HEALTH_METRIC_NAME,
  isS3CredentialsError,
  setConnectionHealth,
} from "./utils/s3-credentials-error.mjs";

// @ts-expect-error legacy
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const prefixes: Array<string> = config.get("prefixes").split(",") ?? ["default"];

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.get("accessKey"),
    secretAccessKey: config.get("secretKey"),
  },
  endpoint: config.get("endpoint"),
  region: config.get("region"),
  forcePathStyle: config.get("region") ?? false,
});

export async function queryS3(
  labelledPlugins: InstanceType<typeof Metric>[],
  globalPlugins: InstanceType<typeof Metric>[],
): Promise<void> {
  let files: _Object[];

  try {
    files = await listAllContents({ Bucket: config.get("bucket") });
  } catch (err) {
    if (isS3CredentialsError(err)) {
      setConnectionHealth(globalPlugins, 0);
      logger.warn("S3 credentials rejected, %s=0", CONNECTION_HEALTH_METRIC_NAME);
      return;
    }

    throw err;
  }

  for (let i = 0; i < labelledPlugins.length; i++) {
    for (const prefix of prefixes) {
      if (isValidRegex(prefix)) {
        const backupNamesByRegex = Array.from(
          new Set(
            files
              .map(f => f.Key)
              .map(key => key?.match(prefix))
              .filter(e => e)
              .map(e => e?.[1]),
          ),
        );

        for (const name of backupNamesByRegex) {
          if (name) {
            labelledPlugins[i]
              .getMesure()
              .labels(name)
              .set(labelledPlugins[i].process(files.filter(file => file.Key?.match(name))));
          }
        }
      } else {
        labelledPlugins[i]
          .getMesure()
          .labels(prefix)
          .set(labelledPlugins[i].process(files.filter(file => file.Key?.includes(prefix))));
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

  logger.debug(`Processing ${list.length} objects`);

  return list;
}
