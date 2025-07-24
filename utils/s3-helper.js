import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../configs/s3.js';
import { ENV } from '../configs/index.js';

export const deleteS3File = async fileUrl => {
  try {
    if (!fileUrl) return false;

    // Extract the S3 key from the URL
    let s3Key;
    if (fileUrl.startsWith('http')) {
      // If it's a full URL, extract the key part
      const url = new URL(fileUrl);
      s3Key = url.pathname.substring(1); // Remove leading slash
    } else {
      // If it's already a key, use as is
      s3Key = fileUrl;
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: ENV.S3_BUCKET_NAME,
      Key: s3Key,
    });

    await s3.send(deleteCommand);
    return true;
  } catch (error) {
    console.error('Error deleting S3 file:', error);
    return false;
  }
};

export const getS3Url = s3Key => {
  if (!s3Key) return null;
  return `https://${ENV.S3_BUCKET_NAME}.s3.${ENV.S3_REGION}.amazonaws.com/${s3Key}`;
};

export const extractS3Key = s3Url => {
  try {
    if (!s3Url || !s3Url.startsWith('http')) return s3Url;

    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};
