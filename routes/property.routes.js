import express from 'express';

import {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByClientId,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getPropertyStats,
} from '../controllers/property.controller.js';
import {
  validateCreateProperty,
  validateUpdateProperty,
  validatePropertySearch,
  validatePropertyId,
  validateClientPropertySearch,
  requireAdminRole,
} from '../middlewares/property.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  uploadPropertyDocumentsToS3,
  handleS3PropertyUploadError,
} from '../middlewares/s3-property.middleware.js';

const propertyRoutes = express.Router();

// Apply authentication and admin role check to all routes
propertyRoutes.use(authenticateToken);
propertyRoutes.use(requireAdminRole);

// Routes for property management
// GET /api/properties/stats - Get property statistics
propertyRoutes.get('/stats', getPropertyStats);

// GET /api/properties - Get all properties with pagination and search
propertyRoutes.get('/', validatePropertySearch, getAllProperties);

// POST /api/properties - Create a new property record
propertyRoutes.post(
  '/create',
  uploadPropertyDocumentsToS3,
  handleS3PropertyUploadError,
  validateCreateProperty,
  createProperty
);

// GET /api/properties/client/:client_id - Get property records by client ID with pagination and search
propertyRoutes.get(
  '/client/:client_id',
  validateClientPropertySearch,
  getPropertiesByClientId
);

// GET /api/properties/:id - Get property record by ID
propertyRoutes.get('/:id', validatePropertyId, getPropertyById);

// PUT /api/properties/:id - Update property record
propertyRoutes.patch(
  '/:id',
  validatePropertyId,
  uploadPropertyDocumentsToS3,
  handleS3PropertyUploadError,
  validateUpdateProperty,
  updateProperty
);

// DELETE /api/properties/:id - Delete property record
propertyRoutes.delete('/:id', validatePropertyId, deleteProperty);

// PATCH /api/properties/:id/toggle-status - Toggle property record active status
propertyRoutes.patch(
  '/:id/toggle-status',
  validatePropertyId,
  togglePropertyStatus
);

export default propertyRoutes;
