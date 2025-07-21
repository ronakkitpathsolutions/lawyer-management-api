import multer from 'multer';
import multerS3 from 'multer-s3';
import { Upload } from '@aws-sdk/lib-storage';
import s3 from '../configs/s3.js';
import { ENV } from '../configs/index.js';

// Simple upload middleware (original functionality)
const getUploadMiddleware = (folder = '') => {
  return multer({
    storage: multerS3({
      s3,
      bucket: ENV.S3_BUCKET_NAME,
      acl: 'public-read',
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '-');
        const fileName = `${timestamp}-${originalName}`;
        const fullPath = `${folder}/${fileName}`;
        cb(null, fullPath);
      },
    }),
  });
};
