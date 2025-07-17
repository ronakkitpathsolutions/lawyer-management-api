import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import Client from '../models/client.model.js';
import Property from '../models/property.model.js';
import { createApiResponse } from '../utils/helper.js';
import { createValidationMiddleware } from './validation.middleware.js';

// Middleware to validate property ID parameter
export const validatePropertyId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json(createApiResponse(false, 'Invalid property ID'));
  }
  next();
};

// Middleware to validate visa ID parameter (simplified version like client middleware)
export const validatePropertyIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json(createApiResponse(false, 'Invalid property ID'));
  }

  next();
};

// Validate create property data
export const validateCreateProperty = createValidationMiddleware(
  Property.validateCreateData
);

// Validate update property data
export const validateUpdateProperty = createValidationMiddleware(
  Property.validateUpdateData
);

// Middleware to validate property search/filter parameters using the standardized approach
export const validatePropertySearchParams = (req, res, next) => {
  // Convert query parameters to appropriate types
  const queryData = {
    ...req.query,
    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    client_id: req.query.client_id
      ? parseInt(req.query.client_id, 10)
      : undefined,
    is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
    created_by: req.query.created_by
      ? parseInt(req.query.created_by, 10)
      : undefined,
  };

  const validation = Property.validateSearchData
    ? Property.validateSearchData(queryData)
    : { success: true, data: queryData };

  if (!validation.success) {
    return res
      .status(400)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.SYSTEM.VALIDATION_FAILED,
          null,
          validation.errors
        )
      );
  }

  req.validatedData = validation.data;
  next();
};

// Validate property search/filter parameters (original version with client validation)
export const validatePropertySearch = async (req, res, next) => {
  try {
    const validationResult = Property.validateSearchData(req.query);
    if (!validationResult.success) {
      return res
        .status(400)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.SYSTEM.VALIDATION_FAILED,
            null,
            validationResult.errors
          )
        );
    }

    // Check if client exists when filtering by client_id
    if (validationResult.data.client_id) {
      const client = await Client.findByPk(validationResult.data.client_id);
      if (!client) {
        return res
          .status(404)
          .json(
            createApiResponse(
              false,
              VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.NOT_FOUND ||
                'Client not found'
            )
          );
      }
    }

    req.validatedData = validationResult.data;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        createApiResponse(
          false,
          'Search validation failed',
          null,
          error.message
        )
      );
  }
};

// Middleware to check if property exists by ID
export const checkPropertyExists = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findByPk(propertyId);

    if (!property) {
      return res
        .status(404)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.PROPERTY.GENERAL.NOT_FOUND ||
              'Property not found'
          )
        );
    }

    req.property = property;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        createApiResponse(
          false,
          'Error checking property existence',
          null,
          error.message
        )
      );
  }
};

// Middleware to check if client exists by ID (for property operations)
export const checkClientExists = async (req, res, next) => {
  try {
    const clientId = req.body.client_id || req.validatedData?.client_id;

    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res
          .status(404)
          .json(
            createApiResponse(
              false,
              VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.NOT_FOUND ||
                'Client not found'
            )
          );
      }
      req.client = client;
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        createApiResponse(
          false,
          'Error checking client existence',
          null,
          error.message
        )
      );
  }
};

// Check if user has admin role (for property operations)
export const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.PROPERTY.GENERAL.UNAUTHORIZED || 'Unauthorized'
        )
      );
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.PROPERTY.GENERAL.FORBIDDEN || 'Forbidden'
        )
      );
  }

  next();
};
