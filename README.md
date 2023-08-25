# s3-prometheus-exporter

## Docker

```
docker pull tchoupinax/s3-prometheus-exporter
```

## Configuration

- `S3_ACCESS_KEY`: 
- `S3_BUCKET_NAME`: The name of the bucket to watch
- `S3_ENDPOINT`: 
- `PORT`: The port on which the server listens
- `S3_PREFIXES`: The prefix of files to watch. You can provide a list separataed by a comma. (e.g `prefix1,prefix2`)
- `S3_SECRET_KEY`: 

## Exemples

When you provide prefixes like `pg,git` you will receive metrics built like this

```
s3_files_count_git 12
s3_files_count_pg 13
```

Also, there is a global metrics that will take care about all files, whatever their prefix are

```
s3_files_count_global 25
```
