export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_SHORT: 'Value is too short',
  TOO_LONG: 'Value is too long',
  INVALID_TYPE: 'Invalid data type',
  MUST_BE_POSITIVE: 'Must be a positive number',
  MUST_BE_INTEGER: 'Must be an integer',
  CANNOT_BE_EMPTY: 'Cannot be empty',
  INVALID_CHARACTERS: 'Contains invalid characters',

  USER: {
    NAME: {
      REQUIRED: 'Name is required',
      TOO_SHORT: 'Name must be at least 2 characters long',
      TOO_LONG: 'Name must not exceed 100 characters',
      EMPTY: 'Name cannot be empty',
      INVALID_FORMAT: 'Name contains invalid characters',
    },
    ROLE: {
      REQUIRED: 'Role is required',
      INVALID: 'Role must be admin or user',
      NOT_FOUND: 'Role not found',
    },
    EMAIL: {
      REQUIRED: 'Email is required',
      INVALID: 'Must be a valid email address',
      TOO_LONG: 'Email must not exceed 150 characters',
      ALREADY_EXISTS: 'Email address already in use',
      NOT_FOUND: 'Email address not found',
    },
    PASSWORD: {
      REQUIRED: 'Password is required',
      TOO_SHORT: 'Password must be at least 6 characters long',
      TOO_LONG: 'Password must not exceed 255 characters',
      EMPTY: 'Password cannot be empty',
      WEAK: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      MISMATCH: "Passwords don't match",
      CURRENT_REQUIRED: 'Current password is required',
      NEW_REQUIRED: 'New password is required',
      CONFIRM_REQUIRED: 'Password confirmation is required',
      INCORRECT: 'Current password is incorrect',
    },
    PHONE_NUMBER: {
      REQUIRED: 'Phone number is required',
      INVALID: 'Must be a valid phone number',
      TOO_SHORT: 'Phone number must be at least 10 digits long',
      TOO_LONG: 'Phone number must not exceed 15 digits',
      NOT_FOUND: 'Phone number not found',
    },
    NATIONALITY: {
      REQUIRED: 'Nationality is required',
      INVALID: 'Must be a valid nationality',
      NOT_FOUND: 'Nationality not found',
    },
    DOB: {
      REQUIRED: 'Date of birth is required',
      INVALID: 'Must be a valid date',
      FUTURE_DATE: 'Date of birth cannot be in the future',
      TOO_OLD: 'User must be at least 18 years old',
    },
    PASSPORT_NUMBER: {
      REQUIRED: 'Passport number is required',
      INVALID: 'Must be a valid passport number',
      TOO_SHORT: 'Passport number must be at least 6 characters long',
      TOO_LONG: 'Passport number must not exceed 20 characters',
      NOT_FOUND: 'Passport number not found',
    },
    IS_ACTIVE: {
      INVALID: 'is_active must be a boolean value',
      REQUIRED: 'is_active status is required',
    },
    GENERAL: {
      NOT_FOUND: 'User not found',
      ALREADY_EXISTS: 'User already exists',
      CREATION_FAILED: 'Failed to create user',
      UPDATE_FAILED: 'Failed to update user',
      DELETE_FAILED: 'Failed to delete user',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Access forbidden',
    },
    PROFILE: {
      INVALID_URL: 'Profile image must be a valid URL',
      TOO_LONG: 'Profile image URL must not exceed 500 characters',
    },
  },

  // Auth messages
  AUTH: {
    TOKEN: {
      REQUIRED: 'Authentication token is required',
      INVALID: 'Invalid authentication token',
      EXPIRED: 'Authentication token has expired',
      MALFORMED: 'Malformed authentication token',
    },
    LOGIN: {
      FAILED: 'Invalid email or password',
      REQUIRED: 'Email and password are required',
      ACCOUNT_LOCKED: 'Account is locked',
      ACCOUNT_DISABLED: 'Account is disabled',
    },
    REGISTER: {
      FAILED: 'Registration failed',
      EMAIL_EXISTS: 'Email already exists',
      WEAK_PASSWORD: 'Password is too weak',
    },
    RESET: {
      TOKEN_REQUIRED: 'Reset token is required',
      TOKEN_INVALID: 'Invalid or expired reset token',
      FAILED: 'Password reset failed',
    },
  },

  // System messages
  SYSTEM: {
    SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection error',
    VALIDATION_FAILED: 'Validation failed',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource conflict',
    RATE_LIMIT: 'Too many requests',
  },

  // Client validation messages
  CLIENT: {
    NAME: {
      REQUIRED: 'Name is required',
      TOO_SHORT: 'Name must be at least 2 characters long',
      TOO_LONG: 'Name must not exceed 100 characters',
      EMPTY: 'Name cannot be empty',
    },
    FAMILY_NAME: {
      REQUIRED: 'Family name is required',
      TOO_SHORT: 'Family name must be at least 2 characters long',
      TOO_LONG: 'Family name must not exceed 100 characters',
      EMPTY: 'Family name cannot be empty',
    },
    EMAIL: {
      REQUIRED: 'Email is required',
      INVALID: 'Must be a valid email address',
      TOO_LONG: 'Email must not exceed 150 characters',
      ALREADY_EXISTS: 'Email address already in use',
      NOT_FOUND: 'Email address not found',
    },
    PASSPORT_NUMBER: {
      REQUIRED: 'Passport number is required',
      INVALID: 'Must be a valid passport number (alphanumeric only)',
      TOO_SHORT: 'Passport number must be at least 6 characters long',
      TOO_LONG: 'Passport number must not exceed 20 characters',
      ALREADY_EXISTS: 'Passport number already exists',
      NOT_FOUND: 'Passport number not found',
    },
    NATIONALITY: {
      REQUIRED: 'Nationality is required',
      INVALID: 'Must be a valid nationality (2-50 characters)',
      NOT_FOUND: 'Nationality not found',
    },
    DOB: {
      REQUIRED: 'Date of birth is required',
      INVALID: 'Must be a valid date (YYYY-MM-DD)',
      FUTURE_DATE: 'Date of birth cannot be in the future',
      TOO_OLD: 'Invalid date of birth',
    },
    AGE: {
      REQUIRED: 'Age is required',
      TOO_YOUNG: 'Client must be at least 18 years old',
      TOO_OLD: 'Age cannot exceed 120 years',
      INVALID: 'Age must be a valid number',
    },
    PHONE_NUMBER: {
      REQUIRED: 'Phone number is required',
      INVALID: 'Must be a valid phone number',
      TOO_SHORT: 'Phone number must be at least 10 digits long',
      TOO_LONG: 'Phone number must not exceed 15 digits',
      NOT_FOUND: 'Phone number not found',
    },
    CURRENT_ADDRESS: {
      REQUIRED: 'Current address is required',
      TOO_SHORT: 'Current address must be at least 10 characters long',
      TOO_LONG: 'Current address must not exceed 500 characters',
      INVALID_LENGTH: 'Current address must be between 10-500 characters',
    },
    ADDRESS_IN_THAILAND: {
      TOO_LONG: 'Thailand address must not exceed 500 characters',
    },
    WHATSAPP: {
      INVALID: 'Must be a valid WhatsApp number',
      INVALID_LENGTH: 'WhatsApp number must be between 10-15 digits',
    },
    LINE: {
      INVALID_LENGTH: 'LINE ID must be between 3-50 characters',
    },
    IS_ACTIVE: {
      INVALID: 'is_active must be a boolean value',
      REQUIRED: 'is_active status is required',
    },
    GENERAL: {
      NOT_FOUND: 'Client not found',
      ALREADY_EXISTS: 'Client already exists',
      CREATION_FAILED: 'Failed to create client',
      UPDATE_FAILED: 'Failed to update client',
      DELETE_FAILED: 'Failed to delete client',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Access forbidden - Admin access required',
    },
  },

  // Common validation messages
  COMMON: {
    ID: {
      REQUIRED: 'ID is required',
      INVALID: 'ID must be a valid integer',
      POSITIVE: 'ID must be a positive number',
    },
    PAGINATION: {
      PAGE_INVALID: 'Page must be a positive integer',
      LIMIT_INVALID: 'Limit must be a positive integer',
      LIMIT_EXCEEDED: 'Limit cannot exceed 100',
      OFFSET_INVALID: 'Offset must be non-negative',
    },
    SEARCH: {
      QUERY_EMPTY: 'Search query cannot be empty',
      QUERY_TOO_LONG: 'Search query cannot exceed 255 characters',
      INVALID_SORT_ORDER: 'Sort order must be ASC or DESC',
    },
    DATE: {
      INVALID_FORMAT: 'Invalid date format',
      START_AFTER_END: 'Start date must be before or equal to end date',
      FUTURE_DATE: 'Date cannot be in the future',
      PAST_DATE: 'Date cannot be in the past',
    },
    FILE: {
      NAME_REQUIRED: 'Filename is required',
      TYPE_REQUIRED: 'File type is required',
      SIZE_INVALID: 'File size must be positive',
      SIZE_EXCEEDED: 'File size cannot exceed 10MB',
      INVALID_TYPE: 'Invalid file type',
      UPLOAD_FAILED: 'File upload failed',
    },
    PHONE: {
      INVALID_FORMAT: 'Invalid phone number format',
      TOO_SHORT: 'Phone number must be at least 10 digits',
      TOO_LONG: 'Phone number cannot exceed 20 characters',
    },
    URL: {
      INVALID: 'Must be a valid URL',
      TOO_LONG: 'URL cannot exceed 500 characters',
    },
  },
};

// Helper function to get nested message
export const getMessage = (path, defaultMessage = 'Validation error') => {
  const pathArray = path.split('.');
  let current = VALIDATION_MESSAGES;

  for (const key of pathArray) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultMessage;
    }
  }

  return typeof current === 'string' ? current : defaultMessage;
};

// Helper function to format validation messages with dynamic values
export const formatMessage = (template, values = {}) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
};

// Export default
export default VALIDATION_MESSAGES;
