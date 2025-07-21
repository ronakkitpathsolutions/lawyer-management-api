import multer from 'multer';
import { Upload } from '@aws-sdk/lib-storage';
import s3 from '../configs/s3.js';
import { ENV } from '../configs/index.js';

// File filter for documents (supports various document formats)
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only document files (PDF, DOC, DOCX, Images, TXT) are allowed for property documents'
      ),
      false
    );
  }
};

// S3 upload middleware for property documents
export const uploadPropertyDocumentsToS3 = async (req, res, next) => {
  console.log('Property documents S3 upload middleware called');

  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: documentFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit per file
      files: 4, // Maximum 4 files (one for each document type)
    },
  }).fields([
    { name: 'land_title_document', maxCount: 1 },
    { name: 'house_title_document', maxCount: 1 },
    { name: 'house_registration_book', maxCount: 1 },
    { name: 'land_lease_agreement', maxCount: 1 },
  ]);

  upload(req, res, async err => {
    if (err) {
      console.error('Multer error:', err);
      return next(err);
    }

    // If no files were uploaded, continue to next middleware
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files uploaded, continuing...');
      return next();
    }

    try {
      console.log('Files received, uploading to S3...');
      const uploadPromises = [];
      const uploadedDocuments = {};

      // Define the document fields
      const documentFields = [
        'land_title_document',
        'house_title_document',
        'house_registration_book',
        'land_lease_agreement',
      ];

      // Process each document type
      for (const fieldName of documentFields) {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          const timestamp = Date.now();
          const propertyId = req.params?.id || 'new';
          const fileExtension = file.originalname
            .split('.')
            .pop()
            .toLowerCase();
          const fileName = `${fieldName}_${propertyId}_${timestamp}.${fileExtension}`;
          const s3Key = `properties/${fileName}`;

          const uploadParams = {
            Bucket: ENV.S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
            Metadata: {
              propertyId: String(propertyId),
              documentType: fieldName,
              originalName: file.originalname,
              uploadDate: new Date().toISOString(),
            },
          };

          const uploadPromise = new Upload({
            client: s3,
            params: uploadParams,
          })
            .done()
            .then(result => {
              uploadedDocuments[fieldName] = {
                originalName: file.originalname,
                filename: fileName,
                s3Key: s3Key,
                s3Url: result.Location,
                size: file.size,
                mimetype: file.mimetype,
                fieldName: fieldName,
              };
              console.log(
                `S3 upload successful for ${fieldName}:`,
                result.Location
              );
            });

          uploadPromises.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Add the uploaded documents to the request object
      req.propertyDocuments = uploadedDocuments;

      next();
    } catch (error) {
      console.error('S3 upload error:', error);
      next(error);
    }
  });
};

// Error handling middleware for S3 property document uploads
export const handleS3PropertyUploadError = (error, req, res, next) => {
  console.error('Property document upload error occurred:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message:
          'Document file too large. Maximum size allowed is 10MB per file.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message:
          'Unexpected field in file upload. Only land_title_document, house_title_document, house_registration_book, and land_lease_agreement fields are allowed.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message:
          'Too many files. Maximum 4 files allowed (one per document type).',
      });
    }
  }

  if (error.message.includes('Only document files')) {
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
    message: 'Property document upload error occurred.',
    error: error.message || 'Unknown error',
  });
};
