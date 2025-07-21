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
    MARITAL_STATUS: {
      INVALID:
        'Marital status must be one of: single, married, common_law, divorced, widowed',
      REQUIRED: 'Marital status is required',
    },
    FATHER_NAME: {
      TOO_SHORT: 'Father name must be at least 2 characters long',
      TOO_LONG: 'Father name must not exceed 100 characters',
      INVALID: 'Father name contains invalid characters',
    },
    MOTHER_NAME: {
      TOO_SHORT: 'Mother name must be at least 2 characters long',
      TOO_LONG: 'Mother name must not exceed 100 characters',
      INVALID: 'Mother name contains invalid characters',
    },
    MARRIED_TO_THAI: {
      INVALID: 'Married to Thai field must be a boolean value (true/false)',
    },
    HAS_CARD: {
      INVALID: 'Yellow/Pink card field must be a boolean value (true/false)',
    },
    HAS_PROPERTY: {
      INVALID: 'Property ownership field must be a boolean value (true/false)',
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

  // Visa validation messages
  VISA: {
    CLIENT_ID: {
      REQUIRED: 'Client ID is required',
      INVALID: 'Client ID must be a valid integer',
      NOT_FOUND: 'Client not found',
    },
    EXISTING_VISA: {
      REQUIRED: 'Existing visa type is required',
      INVALID: 'Invalid existing visa type',
      EMPTY: 'Existing visa type cannot be empty',
    },
    WISHED_VISA: {
      REQUIRED: 'Wished visa type is required',
      INVALID: 'Invalid wished visa type',
      EMPTY: 'Wished visa type cannot be empty',
    },
    LATEST_ENTRY_DATE: {
      INVALID: 'Latest entry date must be a valid date',
      REQUIRED: 'Latest entry date is required when available',
    },
    EXISTING_VISA_EXPIRY: {
      INVALID: 'Existing visa expiry date must be a valid date',
      PAST_DATE: 'Existing visa expiry date cannot be in the past',
    },
    INTENDED_DEPARTURE_DATE: {
      INVALID: 'Intended departure date must be a valid date',
    },
    GENERAL: {
      NOT_FOUND: 'Visa record not found',
      ALREADY_EXISTS: 'Visa record already exists',
      CREATION_FAILED: 'Failed to create visa record',
      UPDATE_FAILED: 'Failed to update visa record',
      DELETE_FAILED: 'Failed to delete visa record',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Access forbidden - Admin access required',
    },
  },

  // Property validation messages
  PROPERTY: {
    CLIENT_ID: {
      REQUIRED: 'Client ID is required',
      INVALID: 'Client ID must be a valid integer',
      NOT_FOUND: 'Client not found',
    },
    AGENT_NAME: {
      REQUIRED: 'Agent name is required',
      TOO_SHORT: 'Agent name must be at least 2 characters long',
      TOO_LONG: 'Agent name must not exceed 100 characters',
      INVALID: 'Agent name contains invalid characters',
    },
    BROKER_COMPANY: {
      REQUIRED: 'Broker company is required',
      TOO_SHORT: 'Broker company must be at least 2 characters long',
      TOO_LONG: 'Broker company must not exceed 100 characters',
      INVALID: 'Broker company contains invalid characters',
    },
    TRANSACTION_TYPE: {
      REQUIRED: 'Transaction type is required',
      INVALID:
        'Transaction type must contain only valid values: buy, sell, rent, sublease, mortgage, construction, joint_venture, consultant_from_owner, consultant_from_buyer. Multiple values can be separated by commas (e.g., "buy,sell,rent")',
    },
    PROPERTY_TYPE: {
      REQUIRED: 'Property type is required',
      INVALID: 'Property type must be one of: house, condo, land, commercial',
    },
    RESERVATION_DATE: {
      REQUIRED: 'Reservation date is required',
      INVALID: 'Reservation date must be a valid date',
    },
    INTENDED_CLOSING_DATE: {
      REQUIRED: 'Intended closing date is required',
      INVALID: 'Intended closing date must be a valid date',
    },
    HANDOVER_DATE: {
      REQUIRED: 'Handover date is required',
      INVALID: 'Handover date must be a valid date',
    },
    PROPERTY_NAME: {
      REQUIRED: 'Property name is required',
      TOO_SHORT: 'Property name must be at least 2 characters long',
      TOO_LONG: 'Property name must not exceed 100 characters',
      INVALID: 'Property name contains invalid characters',
    },
    SELLING_PRICE: {
      REQUIRED: 'Selling price is required',
      INVALID: 'Selling price must be a valid number',
      MUST_BE_POSITIVE: 'Selling price must be a positive number',
    },
    DEPOSIT: {
      REQUIRED: 'Deposit amount is required',
      INVALID: 'Deposit must be a valid number',
      MUST_BE_POSITIVE: 'Deposit must be a positive number',
    },
    INTERMEDIARY_PAYMENT: {
      REQUIRED: 'Intermediary payment is required',
      INVALID: 'Intermediary payment must be a valid number',
      MUST_BE_POSITIVE: 'Intermediary payment must be a positive number',
    },
    CLOSING_PAYMENT: {
      REQUIRED: 'Closing payment is required',
      INVALID: 'Closing payment must be a valid number',
      MUST_BE_POSITIVE: 'Closing payment must be a positive number',
    },
    ACCEPTABLE_METHOD_OF_PAYMENT: {
      REQUIRED: 'Acceptable method of payment is required',
      INVALID:
        'Acceptable method of payment must be one of: direct_transfer, bank_transfer, cash',
    },
    PLACE_OF_PAYMENT: {
      REQUIRED: 'Place of payment is required',
      TOO_SHORT: 'Place of payment must be at least 2 characters long',
      TOO_LONG: 'Place of payment must not exceed 100 characters',
      INVALID: 'Place of payment contains invalid characters',
    },
    PROPERTY_CONDITION: {
      REQUIRED: 'Property condition is required',
      INVALID:
        'Property condition must be one of: new, good, needs_renovation, poor',
    },
    HOUSE_WARRANTY: {
      REQUIRED: 'House warranty is required',
      INVALID: 'House warranty must be a boolean value (true/false)',
    },
    WARRANTY_CONDITION: {
      REQUIRED: 'Warranty condition is required when house warranty is yes',
      TOO_SHORT: 'Warranty condition must be at least 2 characters long',
      TOO_LONG: 'Warranty condition must not exceed 500 characters',
      INVALID: 'Warranty condition contains invalid characters',
    },
    WARRANTY_TERM: {
      REQUIRED: 'Warranty term is required when house warranty is yes',
      TOO_SHORT: 'Warranty term must be at least 2 characters long',
      TOO_LONG: 'Warranty term must not exceed 100 characters',
      INVALID: 'Warranty term contains invalid characters',
    },
    FURNITURE_INCLUDED: {
      REQUIRED: 'Furniture included status is required',
      INVALID: 'Furniture included must be one of: yes, no, negotiable',
    },
    // cost sharing
    TRANSFER_FEE: {
      REQUIRED: 'Transfer fee is required',
      INVALID: 'Transfer fee must be a valid number',
      MUST_BE_POSITIVE: 'Transfer fee must be a positive number',
    },
    WITHHOLDING_TAX: {
      REQUIRED: 'Withholding tax is required',
      INVALID: 'Withholding tax must be a valid number',
      MUST_BE_POSITIVE: 'Withholding tax must be a positive number',
    },
    BUSINESS_TAX: {
      REQUIRED: 'Business tax is required',
      INVALID: 'Business tax must be a valid number',
      MUST_BE_POSITIVE: 'Business tax must be a positive number',
    },
    LEASE_REGISTRATION_FEE: {
      REQUIRED: 'Lease registration fee is required',
      INVALID: 'Lease registration fee must be a valid number',
      MUST_BE_POSITIVE: 'Lease registration fee must be a positive number',
    },
    MORTGAGE_FEE: {
      REQUIRED: 'Mortgage fee is required',
      INVALID: 'Mortgage fee must be a valid number',
      MUST_BE_POSITIVE: 'Mortgage fee must be a positive number',
    },
    USUFRUCT_REGISTRATION_FEE: {
      REQUIRED: 'Usufruct registration fee is required',
      INVALID: 'Usufruct registration fee must be a valid number',
      MUST_BE_POSITIVE: 'Usufruct registration fee must be a positive number',
    },
    SERVITUDE_REGISTRATION_FEE: {
      REQUIRED: 'Servitude registration fee is required',
      INVALID: 'Servitude registration fee must be a valid number',
      MUST_BE_POSITIVE: 'Servitude registration fee must be a positive number',
    },
    DECLARED_LAND_OFFICE_PRICE: {
      REQUIRED: 'Declared land office price is required',
      INVALID: 'Declared land office price must be a valid number',
      MUST_BE_POSITIVE: 'Declared land office price must be a positive number',
    },
    // documentation attachment
    LAND_TITLE: {
      REQUIRED: 'Land title document is required',
      INVALID: 'Land title must be a valid URL',
      TOO_LONG: 'Land title URL must not exceed 500 characters',
    },
    LAND_TITLE_DOCUMENT: {
      REQUIRED: 'Land title document is required',
      INVALID: 'Land title document must be a valid URL',
      TOO_LONG: 'Land title document URL must not exceed 500 characters',
    },
    HOUSE_TITLE: {
      REQUIRED: 'House title document is required',
      INVALID: 'House title must be a valid URL',
      TOO_LONG: 'House title URL must not exceed 500 characters',
    },
    HOUSE_TITLE_DOCUMENT: {
      REQUIRED: 'House title document is required',
      INVALID: 'House title document must be a valid URL',
      TOO_LONG: 'House title document URL must not exceed 500 characters',
    },
    HOUSE_REGISTRATION_BOOK: {
      REQUIRED: 'House registration book is required',
      INVALID: 'House registration book must be a valid URL',
      TOO_LONG: 'House registration book URL must not exceed 500 characters',
    },
    LAND_LEASE_AGREEMENT: {
      REQUIRED: 'Land lease agreement is required',
      INVALID: 'Land lease agreement must be a valid URL',
      TOO_LONG: 'Land lease agreement URL must not exceed 500 characters',
    },
    GENERAL: {
      NOT_FOUND: 'Property record not found',
      ALREADY_EXISTS: 'Property record already exists',
      CREATION_FAILED: 'Failed to create property record',
      UPDATE_FAILED: 'Failed to update property record',
      DELETE_FAILED: 'Failed to delete property record',
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
