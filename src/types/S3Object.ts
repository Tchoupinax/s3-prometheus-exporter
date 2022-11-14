export type S3Object = {
  Key: string;
  LastModified: string;
  Etag: string;
  ChecksumAlgorithm: string[];
  Size: number;
  StorageClass: "STANDARD";
}
