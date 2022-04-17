import * as AWS_SDK from 'aws-sdk'
import Metric from './metrics/metric';

export default async function (plugins: InstanceType<typeof Metric>[]) {
  const files = await listAllContents({ Bucket: "drone-production" });

  for (let i = 0; i < plugins.length; i++) {
    plugins[i].getMesure().set(plugins[i].process(files));
  }
}

async function listAllContents({ Bucket, Prefix }: any): Promise<S3Object[]> {
  let list: S3Object[] = [];
  let shouldContinue: boolean = true;
  let nextContinuationToken: string | undefined = undefined;

  while (shouldContinue) {
    let res: any = await new AWS_SDK.S3({
      endpoint: "http://localhost:9000",
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      // region: "fr-par",
      credentials: {
        accessKeyId: "adminminio",
        secretAccessKey: "adminminio",
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
};
