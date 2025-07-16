import { createApiResponse, asyncHandler } from '../utils/helper.js';
import { Common } from '../utils/validations/index.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';

const createValidationMiddleware = validationFunction => {
  return asyncHandler(async (req, res, next) => {
    const validationResult = await validationFunction(req.body);

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

    // Add validated data to request object for use in controller
    req.validatedData = validationResult.data;
    next();
  }, 'Validation error');
};

const createIdValidationMiddleware = paramName => {
  return asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params[paramName], 10);
    const validationResult = Common.validate.id(id);

    if (!validationResult.success) {
      return res
        .status(400)
        .json(
          createApiResponse(
            false,
            'Invalid ID provided',
            null,
            validationResult.error
          )
        );
    }

    // Add validated ID to request object
    req.validatedId = validationResult.data;
    next();
  }, 'ID validation error');
};

// ID validation middlewares
const idValidationMiddleware = createIdValidationMiddleware('id');

// Generic validation middleware for any validation function
export {
  createValidationMiddleware,
  createIdValidationMiddleware,
  idValidationMiddleware,
};
