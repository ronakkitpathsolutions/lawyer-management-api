import { S3Client } from '@aws-sdk/client-s3';
import { ENV } from './index.js';

const s3 = new S3Client({
  region: ENV.S3_REGION,
  credentials: {
    accessKeyId: ENV.S3_ACCESS_KEY,
    secretAccessKey: ENV.S3_SECRET_KEY,
  },
});

export default s3;
