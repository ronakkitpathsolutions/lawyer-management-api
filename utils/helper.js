import { z } from 'zod';
import VALIDATION_MESSAGES from './constants/messages.js';
import fs from 'fs';
import path from 'path';

export const formatZodErrors = zodError => {
  const errors = {};

  // ZodError usually has an 'issues' property in newer versions
  // But based on console logs, let's try multiple approaches
  let errorArray = null;

  if (zodError && zodError.issues && Array.isArray(zodError.issues)) {
    errorArray = zodError.issues;
  } else if (zodError && zodError.errors && Array.isArray(zodError.errors)) {
    errorArray = zodError.errors;
  }
  // Try accessing the error directly if it has array-like structure
  else if (zodError && typeof zodError[Symbol.iterator] === 'function') {
    errorArray = Array.from(zodError);
  }

  if (!errorArray) {
    return { general: 'Validation error occurred' };
  }

  errorArray.forEach(err => {
    const fieldName = err.path ? err.path.join('.') : 'general';

    // Handle different types of validation errors with user-friendly messages
    if (err.code === 'invalid_type') {
      // Check if the field is required (received undefined)
      if (
        err.message &&
        (err.message.includes('received undefined') ||
          err.message.includes('received null'))
      ) {
        errors[fieldName] = VALIDATION_MESSAGES.REQUIRED;
      } else {
        errors[fieldName] = err.message || 'Invalid value';
      }
    } else if (
      err.code === 'invalid_enum_value' ||
      err.code === 'invalid_value'
    ) {
      // Handle enum validation errors - if received undefined, it's required
      if (err.received === undefined || err.received === null) {
        errors[fieldName] = VALIDATION_MESSAGES.REQUIRED;
      } else {
        errors[fieldName] = err.message || 'Invalid value';
      }
    } else if (err.code === 'invalid_union') {
      // Handle union validation errors (like our client_id field)
      errors[fieldName] = VALIDATION_MESSAGES.REQUIRED;
    } else if (
      err.message &&
      (err.message.includes('is required') ||
        err.message.includes('Required') ||
        err.message.includes('required'))
    ) {
      // Map any "required" error message to the standard format
      errors[fieldName] = VALIDATION_MESSAGES.REQUIRED;
    } else {
      // Use custom error messages if available, otherwise use the Zod message
      errors[fieldName] = err.message || 'Invalid value';
    }
  });

  return errors;
};

export const formatSequelizeErrors = sequelizeError => {
  const errors = {};

  if (sequelizeError.errors && Array.isArray(sequelizeError.errors)) {
    sequelizeError.errors.forEach(err => {
      errors[err.path] = err.message;
    });
  } else if (sequelizeError.message) {
    errors.general = sequelizeError.message;
  }

  return errors;
};

export const createValidationResult = (success, data = null, errors = null) => {
  return {
    success,
    ...(success ? { data } : { errors }),
  };
};

export const validateWithZod = (schema, data) => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return createValidationResult(true, result.data);
    } else {
      const errors = formatZodErrors(result.error);
      return createValidationResult(false, null, errors);
    }
  } catch (err) {
    return createValidationResult(false, null, {
      general: err.message || VALIDATION_MESSAGES.SYSTEM.VALIDATION_FAILED,
    });
  }
};

export const createApiResponse = (
  success,
  message,
  data = null,
  error = null
) => {
  return {
    success,
    message,
    ...(success ? { data } : { error }),
  };
};

export const extractValidationErrors = error => {
  // Safety check for error object
  if (!error) {
    return { general: 'An unknown error occurred' };
  }

  if (error instanceof z.ZodError) {
    return formatZodErrors(error);
  }

  if (error.name === 'SequelizeValidationError') {
    return formatSequelizeErrors(error);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach(err => {
        errors[err.path] = err.message;
      });
    } else {
      errors.general = 'A unique constraint violation occurred';
    }
    return errors;
  }

  // Default error handling
  return {
    general: error.message || 'An unexpected error occurred',
  };
};

export const validateJSONField = (value, options = {}) => {
  const { fieldName = 'Field', allowEmpty = false, allowNull = true } = options;

  // Allow null and undefined values if specified
  if ((value === null || value === undefined) && allowNull) {
    return true;
  }

  // Reject null/undefined if not allowed
  if ((value === null || value === undefined) && !allowNull) {
    throw new Error(`${fieldName} cannot be null or undefined`);
  }

  try {
    // Handle string input - must be valid JSON
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);

      // Ensure parsed result is an object (not array, null, or primitive)
      if (
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        parsed === null
      ) {
        throw new Error(
          `${fieldName} must be a JSON object, not an array, null, or primitive value`
        );
      }

      // Check if empty object is allowed
      if (!allowEmpty && Object.keys(parsed).length === 0) {
        throw new Error(`${fieldName} object cannot be empty`);
      }

      return true;
    }

    // Handle object input
    if (typeof value === 'object') {
      // Reject arrays
      if (Array.isArray(value)) {
        throw new Error(`${fieldName} must be a JSON object, not an array`);
      }

      // Reject null (already handled above, but keeping for safety)
      if (value === null) {
        throw new Error(`${fieldName} cannot be null`);
      }

      // Reject Date objects and other non-plain objects
      if (value.constructor !== Object) {
        throw new Error(`${fieldName} must be a plain JSON object`);
      }

      // Check if empty object is allowed
      if (!allowEmpty && Object.keys(value).length === 0) {
        throw new Error(`${fieldName} object cannot be empty`);
      }

      // Test if object can be serialized to JSON and back
      const serialized = JSON.stringify(value);
      const deserialized = JSON.parse(serialized);

      // Ensure no data loss during serialization
      if (JSON.stringify(deserialized) !== serialized) {
        throw new Error(`${fieldName} object contains non-serializable data`);
      }

      return true;
    }

    // Reject all other types (numbers, booleans, functions, etc.)
    throw new Error(
      `${fieldName} must be a JSON object, received ${typeof value}`
    );
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.message.includes(fieldName)) {
      throw error;
    }

    // Handle JSON parsing errors
    throw new Error(
      `Invalid JSON format in ${fieldName.toLowerCase()}: ${error.message}`
    );
  }
};

export const createJSONValidator = (options = {}) => {
  return function (value) {
    return validateJSONField(value, options);
  };
};

export const asyncHandler = (
  fn,
  errorMessage = VALIDATION_MESSAGES.SYSTEM.SERVER_ERROR
) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log('error', error);
      const formattedErrors = extractValidationErrors(error);
      return res
        .status(500)
        .json(createApiResponse(false, errorMessage, null, formattedErrors));
    }
  };
};

export const PROPERTY_DOCUMENT_FIELDS = [
  'land_title_document',
  'house_title_document',
  'house_registration_book',
  'land_lease_agreement',
];
