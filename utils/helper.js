import { z } from 'zod';
import VALIDATION_MESSAGES from './constants/messages.js';
import fs from 'fs';
import path from 'path';

export const formatZodErrors = zodError => {
  const errors = {};

  // ZodError usually has an 'issues' property in newer versions
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

export const EXISTING_VISA_MAP = {
  entry_stamp_30_day: 'Entry Stamp (30 Day)',
  entry_stamp_60_day: 'Entry Stamp (60 Day)',
  tourist_visa_60_day: 'Tourist Visa (60 Day)',
  non_immigrant_o_visa_3_month: 'Non-Immigrant O Visa (3 Month)',
  married_to_thai_visa: 'Married to Thai Visa',
  thai_child_visa: 'Thai Child Visa',
  student_visa_language_school: 'Student Visa (Language School)',
  student_visa_school_or_university: 'Student Visa (School or University)',
  retirement_visa: 'Retirement Visa',
  guardian_visa: 'Guardian Visa',
  dependent_visa: 'Dependent Visa',
  non_immigrant_b_visa_3_month: 'Non-Immigrant B Visa (3 Month)',
  business_visa_employment_1_year: 'Business Visa (Employment – 1 Year)',
  retirement_visa_1_year: 'Retirement Visa (1 Year)',
  non_immigrant_oa_visa: 'Non-Immigrant OA Visa',
  elite_visa: 'Elite Visa',
  dtv: 'DTV',
  ltr_wealthy_pensioner: 'LTR: Wealthy Pensioner',
  ltr_wealthy_citizen: 'LTR: Wealthy Citizen',
  ltr_highly_skilled_professional: 'LTR: Highly Skilled/Professional',
  ltr_work_from_thailand_professional: 'LTR: Work from Thailand Professional',
};

export const WISHED_VISA_MAP = {
  renew_the_existing_one: 'Renew the Existing One',
  non_immigrant_o_visa_3_month: 'Non-Immigrant O Visa (3 Month)',
  married_to_thai_visa: 'Married to Thai Visa',
  thai_child_visa: 'Thai Child Visa',
  student_visa_language_school: 'Student Visa (Language School)',
  student_visa_school_or_university: 'Student Visa (School or University)',
  retirement_visa: 'Retirement Visa',
  guardian_visa: 'Guardian Visa',
  dependent_visa: 'Dependent Visa',
  non_immigrant_b_visa_3_month: 'Non-Immigrant B Visa (3 Month)',
  business_visa_employment_1_year: 'Business Visa (Employment - 1 Year)',
  retirement_visa_1_year: 'Retirement Visa (1 Year)',
  non_immigrant_oa_visa: 'Non-Immigrant OA Visa',
  elite_visa: 'Elite Visa',
  dtv: 'DTV',
  ltr_wealthy_pensioner: 'LTR: Wealthy Pensioner',
  ltr_wealthy_citizen: 'LTR: Wealthy Citizen',
  ltr_highly_skilled_professional: 'LTR: Highly Skilled/Professional',
  ltr_work_from_thailand_professional: 'LTR: Work from Thailand Professional',
};

export const RE_ENTRY_PERMIT_TEXT_OBJECT = {
  single: 'Single',
  multiple: 'Multiple',
  not_required: 'Not Required',
};

export const PROPERTY_EXPORT_COLUMN_WIDTHS = {
  id: 10,
  client_id: 12,
  property_name: 30,
  agent_name: 25,
  broker_company: 28,
  transaction_type: 20,
  property_type: 20,

  reservation_date: 18,
  intended_closing_date: 22,
  intended_closing_date_specific: 26,
  handover_date: 18,

  selling_price: 18,
  deposit: 15,
  intermediary_payment: 20,
  closing_payment: 18,

  acceptable_method_of_payment: 30,
  place_of_payment: 25,

  property_condition: 22,
  house_warranty: 18,
  warranty_condition: 25,
  warranty_term: 18,
  furniture_included: 20,

  transfer_fee: 18,
  withholding_tax: 18,
  business_tax: 18,
  lease_registration_fee: 22,
  mortgage_fee: 18,
  usufruct_registration_fee: 26,
  servitude_registration_fee: 26,

  declared_land_office_price: 24,

  land_title: 20,
  land_title_document: 28,
  house_title: 20,
  house_title_document: 28,
  house_registration_book: 28,
  land_lease_agreement: 28,

  repair_details: 40,
  remarks: 45,

  created_by: 18,
  is_active: 15,
};

export const TYPE_OF_TRANSACTION_MAP = {
  buy: 'Buy',
  sell: 'Sell',
  rental: 'Rental',
  usufruct: 'Usufruct',
  mortgage: 'Mortgage',
  subdivision: 'Subdivision',
  consolidation: 'Consolidation',
  servitude: 'Servitude',
  other: 'Other',
};

export const TYPE_OF_PROPERTY_MAP = {
  house_and_land_freehold: 'House and Land (Freehold)',
  house_and_land_leasehold: 'House and Land (Leasehold)',
  condominium_freehold: 'Condominium (Thai Quota)',
  condominium_leasehold: 'Condominium (Foreign Quota)',
  empty_land: 'Empty Land',
};

export const HANDOVER_DATE_MAP = {
  at_closing: 'At Closing',
  after_closing: 'After Closing',
};

export const INTENDED_CLOSING_DATE_MAP = {
  on_or_before: 'On or Before',
  after: 'After',
  only_on: 'Only on',
};

export const ACCEPTABLE_PAYMENT_METHODS_MAP = {
  cashiers_check_recommended: "Cashier's Check Recommended",
  cash_transfer: 'Cash Transfer',
  personal_check: 'Personal Check',
  cash: 'Cash',
  other: 'Other',
};

export const PLACE_OF_PAYMENT_MAP = {
  thailand: 'Thailand',
  other: 'Other',
};

export const PROPERTY_CONDITION_MAP = {
  new: 'New',
  good_working: 'Good Working',
  as_seen: 'As Seen',
  sometimes_items_to_be_repaired: 'Some items to be repaired',
};

export const YES_NO_MAP = {
  yes: 'Yes',
  no: 'No',
};

export const FURNITURE_INCLUDED_MAP = {
  not_furniture_included: 'Not Furniture Included',
  specific_furniture_included: 'Specific Furniture Included',
  all_furniture_included: 'All Furniture Included',
  selected_furniture_included: 'Selected Furniture Included',
  all_furniture_except_personal_items: 'All Furniture Except Personal Items',
};

export const BUYER_SELLER_COST_MAP = {
  buyer_only: 'Buyer Only',
  seller_only: 'Seller Only',
  share_50_50: 'Share (50/50)',
};

export const MORTGAGOR_MORTGAGEE_COST_MAP = {
  mortgagor_only: 'Mortgagor Only',
  mortgagee_only: 'Mortgagee Only',
  share_50_50: 'Share (50/50)',
};

export const USUFRUCTUARY_OWNER_COST_MAP = {
  usufructuary_only: 'Usufructuary Only',
  owner_only: 'Owner Only',
  share_50_50: 'Share (50/50)',
};

export const SERVITUDE_COST_MAP = {
  dominant_owner_only: 'Dominant Owner Only',
  servient_owner_only: 'Servient Owner Only',
  share_50_50: 'Share (50/50)',
};

export const DECLARED_LAND_OFFICE_PRICE_MAP = {
  actual_price: 'Actual Price',
  lowest_possible_price: 'Lowest Possible Price',
  mediocre_price: 'Mediocre Price',
};

export const LAND_TITLE_MAP = {
  land_title_deed: 'Land Title Deed',
  certificate_of_utilization: 'Certificate of Utilization',
};

export const HOUSE_TITLE_MAP = {
  building_permit: 'Building Permit',
  official_house_sale_and_purchase_agreement:
    'Official House Sale and Purchase Agreement',
};

export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1);
