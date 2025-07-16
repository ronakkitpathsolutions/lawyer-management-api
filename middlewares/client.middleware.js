import { createApiResponse } from '../utils/helper.js';
import { createValidationMiddleware } from './validation.middleware.js';
import Client from '../models/client.model.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';

// Middleware to validate client creation data using the standardized approach
export const validateCreateClient = createValidationMiddleware(
  Client.validateCreateData
);

// Middleware to validate client update data using the standardized approach
export const validateUpdateClient = createValidationMiddleware(
  Client.validateUpdateData
);

// Middleware to validate client search/filter parameters using the standardized approach
export const validateClientSearch = (req, res, next) => {
  // Convert query parameters to appropriate types
  const queryData = {
    ...req.query,
    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
    married_to_thai_and_registered: req.query.married_to_thai_and_registered
      ? req.query.married_to_thai_and_registered === 'true'
      : undefined,
    has_yellow_or_pink_card: req.query.has_yellow_or_pink_card
      ? req.query.has_yellow_or_pink_card === 'true'
      : undefined,
    has_bought_property_in_thailand: req.query.has_bought_property_in_thailand
      ? req.query.has_bought_property_in_thailand === 'true'
      : undefined,
    created_by: req.query.created_by
      ? parseInt(req.query.created_by, 10)
      : undefined,
  };

  const validation = Client.validateSearchData(queryData);

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

// Middleware to validate client ID parameter
export const validateClientId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json(createApiResponse(false, 'Invalid client ID'));
  }

  next();
};

// Middleware to check if user is admin (required for all client operations)
export const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.UNAUTHORIZED)
      );
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.CLIENT.GENERAL.FORBIDDEN)
      );
  }

  next();
};
