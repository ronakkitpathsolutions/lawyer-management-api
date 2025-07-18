import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import Client from '../models/client.model.js';
import Visa from '../models/visa.model.js';
import { createApiResponse } from '../utils/helper.js';
import { createValidationMiddleware } from './validation.middleware.js';

// Validate visa ID
// Middleware to validate visa ID parameter
export const validateVisaId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json(createApiResponse(false, 'Invalid visa ID'));
  }
  next();
};

// Middleware to validate visa ID parameter (simplified version like client middleware)
export const validateVisaIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json(createApiResponse(false, 'Invalid visa ID'));
  }

  next();
};

// Validate create visa data
export const validateCreateVisa = createValidationMiddleware(
  Visa.validateCreateData
);

// Validate update visa data
export const validateUpdateVisa = createValidationMiddleware(
  Visa.validateUpdateData
);

// Middleware to validate visa search/filter parameters using the standardized approach
export const validateVisaSearchParams = (req, res, next) => {
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

  const validation = Visa.validateSearchData
    ? Visa.validateSearchData(queryData)
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

// Validate visa search/filter parameters (original version with client validation)
export const validateVisaSearch = async (req, res, next) => {
  try {
    const validationResult = Visa.validateSearchData(req.query);
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
              VALIDATION_MESSAGES.VISA.CLIENT_ID.NOT_FOUND
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

// Middleware to check if visa exists by ID
export const checkVisaExists = async (req, res, next) => {
  try {
    const visaId = req.params.id;
    const visa = await Visa.findByPk(visaId);

    if (!visa) {
      return res
        .status(404)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.VISA.GENERAL.NOT_FOUND || 'Visa not found'
          )
        );
    }

    req.visa = visa;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        createApiResponse(
          false,
          'Error checking visa existence',
          null,
          error.message
        )
      );
  }
};

// Middleware to check if client exists by ID (for visa operations)
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
              VALIDATION_MESSAGES.VISA.CLIENT_ID.NOT_FOUND || 'Client not found'
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

// Check if user has admin role (for visa operations)
export const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.UNAUTHORIZED)
      );
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.FORBIDDEN)
      );
  }

  next();
};

// Middleware to validate client ID parameter and search query parameters
export const validateClientVisaSearch = async (req, res, next) => {
  try {
    // Validate client_id parameter
    const { client_id } = req.params;
    if (!client_id || isNaN(parseInt(client_id, 10))) {
      return res
        .status(400)
        .json(createApiResponse(false, 'Invalid client ID'));
    }

    // Parse and validate query parameters
    const queryData = {
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
      search: req.query.search || '',
      existing_visa: req.query.existing_visa || undefined,
      wished_visa: req.query.wished_visa || undefined,
      is_active:
        req.query.is_active !== undefined
          ? req.query.is_active === 'true'
          : undefined,
    };

    // Validate page and limit
    if (queryData.page < 1) {
      return res
        .status(400)
        .json(createApiResponse(false, 'Page must be greater than 0'));
    }

    if (queryData.limit < 1 || queryData.limit > 100) {
      return res
        .status(400)
        .json(createApiResponse(false, 'Limit must be between 1 and 100'));
    }

    // Add validated data to request
    req.validatedQuery = queryData;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        createApiResponse(
          false,
          'Parameter validation failed',
          null,
          error.message
        )
      );
  }
};
