import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import Client from '../models/client.model.js';
import Relationship from '../models/relationship.model.js';
import { createApiResponse } from '../utils/helper.js';
import { createValidationMiddleware } from './validation.middleware.js';

// Validate relationship ID
// Middleware to validate relationship ID parameter

export const validateRelationshipId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json(createApiResponse(false, 'Invalid relationship ID'));
  }
  next();
};

// Middleware to validate relationship ID parameter (simplified version like client middleware)
export const validateRelationshipIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res
      .status(400)
      .json(createApiResponse(false, 'Invalid relationship ID'));
  }

  next();
};

// Validate create relationship data
export const validateCreateRelationship = createValidationMiddleware(
  Relationship.validateCreateData
);

// Validate update relationship data
export const validateUpdateRelationship = createValidationMiddleware(
  Relationship.validateUpdateData
);

// Middleware to validate relationship search/filter parameters using the standardized approach
export const validateRelationshipSearchParams = (req, res, next) => {
  // Convert query parameters to appropriate types
  const queryData = {
    ...req.query,
    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    client_id: req.query.client_id
      ? parseInt(req.query.client_id, 10)
      : undefined,
    // Ensure sortBy and sortOrder are properly passed through
    sortBy: req.query.sortBy || undefined,
    sortOrder: req.query.sortOrder || undefined,
  };

  const validation = Relationship.validateSearchData
    ? Relationship.validateSearchData(queryData)
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

// Validate relationship search/filter parameters (original version with client validation)
export const validateRelationshipSearch = async (req, res, next) => {
  try {
    // Convert query parameters to appropriate types
    const queryData = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
      client_id: req.query.client_id
        ? parseInt(req.query.client_id, 10)
        : undefined,
      // Ensure sortBy and sortOrder are properly passed through
      sortBy: req.query.sortBy || undefined,
      sortOrder: req.query.sortOrder || undefined,
    };

    const validationResult = Relationship.validateSearchData(queryData);

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
              VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.NOT_FOUND
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

// Check if user has admin role (for relationship operations)
export const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.RELATIONSHIP.GENERAL.UNAUTHORIZED
        )
      );
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.RELATIONSHIP.GENERAL.FORBIDDEN
        )
      );
  }

  next();
};
