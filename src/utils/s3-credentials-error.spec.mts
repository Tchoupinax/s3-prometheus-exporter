import { describe, expect, it } from "vitest";

import { isS3CredentialsError } from "./s3-credentials-error.mjs";

describe("isS3CredentialsError", () => {
  it("detects InvalidAccessKeyId from Code", () => {
    expect(
      isS3CredentialsError({
        name: "S3ServiceException",
        Code: "InvalidAccessKeyId",
        message: "The AWS Access Key Id you provided does not exist in our records.",
        $metadata: { httpStatusCode: 403 },
      }),
    ).toBe(true);
  });

  it("detects InvalidAccessKeyId from name", () => {
    expect(
      isS3CredentialsError({
        name: "InvalidAccessKeyId",
        message: "The AWS Access Key Id you provided does not exist in our records.",
        $metadata: { httpStatusCode: 403 },
      }),
    ).toBe(true);
  });

  it("detects credentials errors from message when code is missing", () => {
    expect(
      isS3CredentialsError({
        name: "S3ServiceException",
        message: "The AWS Access Key Id you provided does not exist in our records.",
      }),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(
      isS3CredentialsError({
        name: "NoSuchBucket",
        Code: "NoSuchBucket",
        message: "The specified bucket does not exist",
        $metadata: { httpStatusCode: 404 },
      }),
    ).toBe(false);
  });
});
