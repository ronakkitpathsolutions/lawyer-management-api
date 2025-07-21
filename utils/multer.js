import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can create subdirectories based on file type or user requirements
    let uploadPath = './uploads';

    // Create subdirectories based on fieldname or file type
    if (file.fieldname === 'profile') {
      uploadPath = './uploads/profiles';
    } else if (file.fieldname === 'document') {
      uploadPath = './uploads/documents';
    } else if (file.fieldname === 'property') {
      uploadPath = './uploads/properties';
    } else if (file.fieldname === 'visa') {
      uploadPath = './uploads/visa';
    } else if (
      [
        'land_title_document',
        'house_title_document',
        'house_registration_book',
        'land_lease_agreement',
      ].includes(file.fieldname)
    ) {
      uploadPath = './uploads/property';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    const filename = `${file.fieldname}_${timestamp}${extension}`;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimes.join(', ')}`
      ),
      false
    );
  }
};

// Main multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
    files: 5, // Maximum 5 files per request
  },
});

// Middleware functions for different upload scenarios
export const uploadSingle = fieldName => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName, maxFiles = 5) => {
  return upload.array(fieldName, maxFiles);
};

// Predefined middleware for common use cases
export const uploadProfileImage = upload.single('profile');

// Property documents upload configuration
export const uploadPropertyDocuments = upload.fields([
  { name: 'land_title_document', maxCount: 1 },
  { name: 'house_title_document', maxCount: 1 },
  { name: 'house_registration_book', maxCount: 1 },
  { name: 'land_lease_agreement', maxCount: 1 },
]);

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size allowed is 10MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum files allowed per request is 5.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.',
      });
    }
  }

  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'File upload error occurred.',
  });
};

// Helper function to get file URL
export const getFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// Helper function to delete uploaded file
export const deleteFile = filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export default upload;
