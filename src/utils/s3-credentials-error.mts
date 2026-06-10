import { Metric } from "../metrics/metric.mjs";

export const CONNECTION_HEALTH_METRIC_NAME = "s3_connection_health";

const CREDENTIALS_ERROR_CODES = new Set([
  "AccessDenied",
  "Forbidden",
  "InvalidAccessKeyId",
  "SignatureDoesNotMatch",
]);

const CREDENTIALS_ERROR_MESSAGES = [
  "Access Key Id you provided does not exist",
  "Signature we calculated does not match the signature you provided",
  "The security token included in the request is invalid",
  "Unable to locate credentials",
];

type AwsLikeError = {
  name?: string;
  Code?: string;
  message?: string;
  $metadata?: { httpStatusCode?: number };
};

function getErrorCode(error: AwsLikeError): string {
  return error.Code ?? error.name ?? "";
}

export function isS3CredentialsError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  const error = err as AwsLikeError;
  const code = getErrorCode(error);

  if (CREDENTIALS_ERROR_CODES.has(code)) {
    return true;
  }

  const statusCode = error.$metadata?.httpStatusCode;
  if (statusCode === 401 || statusCode === 403) {
    return true;
  }

  const message = error.message ?? "";
  return CREDENTIALS_ERROR_MESSAGES.some(fragment => message.includes(fragment));
}

export function setConnectionHealth(
  globalPlugins: InstanceType<typeof Metric>[],
  value: 0 | 1,
): void {
  const connectionHealth = globalPlugins.find(plugin => plugin.name() === CONNECTION_HEALTH_METRIC_NAME);
  connectionHealth?.getMesure().set(value);
}
