import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProfileImage,
  uploadDocument,
  uploadPropertyImages,
  uploadVisaDocuments,
  uploadPropertyDocuments,
  handleUploadError,
  getFileUrl,
  deleteFile,
} from '../utils/multer.js';

// Middleware to handle single file upload with custom validation
export const handleSingleUpload = (fieldName, options = {}) => {
  return async (req, res, next) => {
    const upload = uploadSingle(fieldName);

    upload(req, res, error => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }

      // Add file information to request object
      if (req.file) {
        req.fileInfo = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: getFileUrl(req, req.file.filename),
        };
      }

      next();
    });
  };
};

// Middleware to handle multiple file upload
export const handleMultipleUpload = (fieldName, maxFiles = 5) => {
  return async (req, res, next) => {
    const upload = uploadMultiple(fieldName, maxFiles);

    upload(req, res, error => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }

      // Add files information to request object
      if (req.files && req.files.length > 0) {
        req.filesInfo = req.files.map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          url: getFileUrl(req, file.filename),
        }));
      }

      next();
    });
  };
};

// Middleware for profile image upload
export const handleProfileUpload = (req, res, next) => {
  uploadProfileImage(req, res, error => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    if (req.file) {
      req.profileImage = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req, req.file.filename),
      };
    }

    next();
  });
};

// Middleware for document upload
export const handleDocumentUpload = (req, res, next) => {
  uploadDocument(req, res, error => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    if (req.file) {
      req.document = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: getFileUrl(req, req.file.filename),
      };
    }

    next();
  });
};

// Middleware for property images upload
export const handlePropertyImagesUpload = (req, res, next) => {
  uploadPropertyImages(req, res, error => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    if (req.files && req.files.length > 0) {
      req.propertyImages = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(req, file.filename),
      }));
    }

    next();
  });
};

// Middleware for visa documents upload
export const handleVisaDocumentsUpload = (req, res, next) => {
  uploadVisaDocuments(req, res, error => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    if (req.files && req.files.length > 0) {
      req.visaDocuments = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(req, file.filename),
      }));
    }

    next();
  });
};

// Middleware for property documents upload
export const handlePropertyDocumentsUpload = (req, res, next) => {
  uploadPropertyDocuments(req, res, error => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    if (req.files) {
      req.propertyDocuments = {};

      // Process each document type
      const documentFields = [
        'land_title_document',
        'house_title_document',
        'house_registration_book',
        'land_lease_agreement',
      ];

      documentFields.forEach(fieldName => {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          req.propertyDocuments[fieldName] = {
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: `${req.protocol}://${req.get('host')}/uploads/property-documents/${file.filename}`,
            fieldName: fieldName,
          };
        }
      });
    }

    next();
  });
};

// Cleanup middleware to delete uploaded files on error
export const cleanupUploadedFiles = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // If there's an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      // Clean up single file
      if (req.file) {
        deleteFile(req.file.path);
      }

      // Clean up multiple files
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files.forEach(file => deleteFile(file.path));
        } else {
          Object.values(req.files).forEach(fileArray => {
            fileArray.forEach(file => deleteFile(file.path));
          });
        }
      }
    }

    originalSend.call(this, data);
  };

  next();
};

// Export utility functions
export { getFileUrl, deleteFile, handleUploadError };
