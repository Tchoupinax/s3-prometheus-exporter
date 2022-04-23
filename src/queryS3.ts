import * as AWS_SDK from 'aws-sdk'
import Metric from './metrics/metric';
import { S3Object } from './types/S3Object';
import * as config from 'config';

export default async function (plugins: InstanceType<typeof Metric>[]) {
  const files = await listAllContents({ Bucket: config.get('bucket') });

  for (let i = 0; i < plugins.length; i++) {
    const prefix = plugins[i].getPrefix();
    plugins[i].getMesure().set(plugins[i].process(files.filter(file => file.Key.includes(prefix))));
  }
}

async function listAllContents({ Bucket, Prefix }: any): Promise<S3Object[]> {
  let list: S3Object[] = [];
  let shouldContinue = true;
  let nextContinuationToken: string | undefined = undefined;

  while (shouldContinue) {
    const res: any = await new AWS_SDK.S3({
      endpoint: config.get('endpoint'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      // region: "fr-par",
      credentials: {
        accessKeyId: config.get('accessKey'),
        secretAccessKey: config.get('secretKey'),
      }
    })
      .listObjectsV2({
        Bucket,
        Prefix,
        ContinuationToken: nextContinuationToken ?? undefined,
      })
      .promise();

    list = [...list, ...res.Contents!];

    if (!res.IsTruncated) {
      shouldContinue = false;
      nextContinuationToken = undefined;
    } else {
      nextContinuationToken = res.NextContinuationToken;
    }
  }

  return list;
}
