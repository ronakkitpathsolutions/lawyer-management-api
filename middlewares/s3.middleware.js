import multer from 'multer';
import multerS3 from 'multer-s3';
import { Upload } from '@aws-sdk/lib-storage';
import s3 from '../configs/s3.js';
import { ENV } from '../configs/index.js';

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only image files (JPEG, PNG, GIF, WebP) are allowed for profile pictures'
      ),
      false
    );
  }
};

// Simple upload middleware (original functionality)
export const getUploadMiddleware = (folder = '') => {
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
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit for images
    },
  });
};

// Specific middleware for profile image uploads - using AWS SDK directly to avoid header issues
export const uploadProfileImageToS3 = async (req, res, next) => {
  console.log('Upload middleware called');

  const upload = multer({
    storage: multer.memoryStorage(), // Store in memory first
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1,
    },
  }).single('profile');

  upload(req, res, async err => {
    if (err) {
      console.error('Multer error:', err);
      return next(err);
    }

    // If no file was uploaded, continue to next middleware
    if (!req.file) {
      console.log('No file uploaded, continuing...');
      return next();
    }

    try {
      console.log('File received, uploading to S3...');
      const timestamp = Date.now();
      const userId = req.user?.id || 'unknown';
      const fileExtension = req.file.originalname
        .split('.')
        .pop()
        .toLowerCase();
      const fileName = `profile_${userId}_${timestamp}.${fileExtension}`;
      const s3Key = `profiles/${fileName}`;

      const uploadParams = {
        Bucket: ENV.S3_BUCKET_NAME,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
        Metadata: {
          userId: String(userId),
          originalName: req.file.originalname,
          uploadDate: new Date().toISOString(),
        },
      };

      const upload = new Upload({
        client: s3,
        params: uploadParams,
      });

      const result = await upload.done();
      console.log('S3 upload successful:', result.Location);

      // Add the S3 URL to the request object (mimicking multer-s3 behavior)
      req.file.location = result.Location;
      req.file.key = s3Key;

      next();
    } catch (error) {
      console.error('S3 upload error:', error);
      next(error);
    }
  });
};

// Error handling middleware for S3 uploads
export const handleS3UploadError = (error, req, res, next) => {
  console.error('Upload error occurred:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Profile image too large. Maximum size allowed is 5MB.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message:
          'Unexpected field in file upload. Only "profile" field is allowed.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one profile image is allowed.',
      });
    }
  }

  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // S3 specific errors
  if (error.name === 'CredentialsError') {
    return res.status(500).json({
      success: false,
      message: 'S3 authentication failed. Please check credentials.',
    });
  }

  if (error.name === 'NoSuchBucket') {
    return res.status(500).json({
      success: false,
      message: 'S3 bucket not found. Please check bucket configuration.',
    });
  }

  // If no error occurred, continue to next middleware
  if (!error) {
    return next();
  }

  return res.status(500).json({
    success: false,
    message: 'File upload error occurred.',
    error: error.message || 'Unknown error',
  });
};
