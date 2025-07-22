import { property, z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';
import {
  TYPE_OF_TRANSACTION_TEXTS,
  TYPE_OF_PROPERTY_TEXTS,
  ACCEPTABLE_PAYMENT_METHODS_TEXTS,
  FURNITURE_INCLUDED_TEXTS,
  COST_SHARING_TEXTS,
  PROPERTY_CONDITION_TEXTS,
  HOUSE_TITLE_TEXTS,
  LAND_TITLE_TEXTS,
  DECLARED_LAND_OFFICE_PRICE_TEXTS,
  PLACE_OF_PAYMENT_TEXTS,
  HANDOVER_DATE_TEXTS,
} from '../constants/variables.js';

// Base property validation schema
const PropertyValidationSchema = z
  .object({
    client_id: z
      .union([z.string(), z.number()])
      .transform(val => {
        if (typeof val === 'string') {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      })
      .pipe(
        z
          .number({
            required_error: VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.REQUIRED,
            invalid_type_error: VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.INVALID,
          })
          .int(VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.INVALID)
          .positive(VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.INVALID)
      ),
    property_name: z
      .string()
      .min(2, VALIDATION_MESSAGES.PROPERTY.PROPERTY_NAME.TOO_SHORT)
      .max(100, VALIDATION_MESSAGES.PROPERTY.PROPERTY_NAME.TOO_LONG)
      .trim()
      .refine(
        val => val.length > 0,
        VALIDATION_MESSAGES.PROPERTY.PROPERTY_NAME.INVALID
      ),
    agent_name: z
      .string()
      .min(2, VALIDATION_MESSAGES.PROPERTY.AGENT_NAME.TOO_SHORT)
      .max(100, VALIDATION_MESSAGES.PROPERTY.AGENT_NAME.TOO_LONG)
      .trim()
      .refine(
        val => val.length > 0,
        VALIDATION_MESSAGES.PROPERTY.AGENT_NAME.INVALID
      )
      .optional()
      .nullable(),
    broker_company: z
      .string()
      .min(2, VALIDATION_MESSAGES.PROPERTY.BROKER_COMPANY.TOO_SHORT)
      .max(100, VALIDATION_MESSAGES.PROPERTY.BROKER_COMPANY.TOO_LONG)
      .trim()
      .refine(
        val => val.length > 0,
        VALIDATION_MESSAGES.PROPERTY.BROKER_COMPANY.INVALID
      )
      .optional()
      .nullable(),
    transaction_type: z
      .string()
      .optional()
      .nullable()
      .transform(val => {
        if (!val || val === '') return null;
        return val;
      }),
    property_type: z
      .enum(TYPE_OF_PROPERTY_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.PROPERTY_TYPE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    reservation_date: z
      .string()
      .optional()
      .nullable()
      .transform(val => {
        if (!val || val === '') return null;

        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return val;
        }

        // Check if it's in DD-MM-YYYY format and convert
        if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
          const [day, month, year] = val.split('-');
          return `${year}-${month}-${day}`;
        }

        // Check if it's in DD/MM/YYYY format and convert
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [day, month, year] = val.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return val;
      })
      .refine(
        val => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val),
        VALIDATION_MESSAGES.PROPERTY.RESERVATION_DATE.INVALID
      ),
    intended_closing_date: z
      .string()
      .optional()
      .nullable()
      .transform(val => {
        if (!val || val === '') return null;

        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return val;
        }

        // Check if it's in DD-MM-YYYY format and convert
        if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
          const [day, month, year] = val.split('-');
          return `${year}-${month}-${day}`;
        }

        // Check if it's in DD/MM/YYYY format and convert
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [day, month, year] = val.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return val;
      })
      .refine(
        val => val === null || /^\d{4}-\d{2}-\d{2}$/.test(val),
        VALIDATION_MESSAGES.PROPERTY.INTENDED_CLOSING_DATE.INVALID
      ),
    handover_date: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform(val => (val === '' ? null : val))
      .refine(
        val =>
          val === null ||
          val === undefined ||
          HANDOVER_DATE_TEXTS.includes(val),
        VALIDATION_MESSAGES.PROPERTY.HANDOVER_DATE.INVALID
      ),
    selling_price: z
      .union([z.string(), z.number()])
      .transform(val => {
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      })
      .pipe(
        z
          .number({
            invalid_type_error:
              VALIDATION_MESSAGES.PROPERTY.SELLING_PRICE.INVALID,
          })
          .positive(VALIDATION_MESSAGES.PROPERTY.SELLING_PRICE.MUST_BE_POSITIVE)
      )
      .optional()
      .nullable(),
    deposit: z
      .union([z.string(), z.number()])
      .transform(val => {
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      })
      .pipe(
        z
          .number({
            invalid_type_error: VALIDATION_MESSAGES.PROPERTY.DEPOSIT.INVALID,
          })
          .positive(VALIDATION_MESSAGES.PROPERTY.DEPOSIT.MUST_BE_POSITIVE)
      )
      .optional()
      .nullable(),
    intermediary_payment: z
      .union([z.string(), z.number()])
      .transform(val => {
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      })
      .pipe(
        z
          .number({
            invalid_type_error:
              VALIDATION_MESSAGES.PROPERTY.INTERMEDIARY_PAYMENT.INVALID,
          })
          .positive(
            VALIDATION_MESSAGES.PROPERTY.INTERMEDIARY_PAYMENT.MUST_BE_POSITIVE
          )
      )
      .optional()
      .nullable(),
    closing_payment: z
      .union([z.string(), z.number()])
      .transform(val => {
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? undefined : parsed;
        }
        return val;
      })
      .pipe(
        z
          .number({
            invalid_type_error:
              VALIDATION_MESSAGES.PROPERTY.CLOSING_PAYMENT.INVALID,
          })
          .positive(
            VALIDATION_MESSAGES.PROPERTY.CLOSING_PAYMENT.MUST_BE_POSITIVE
          )
      )
      .optional()
      .nullable(),
    acceptable_method_of_payment: z
      .string()
      .optional()
      .nullable()
      .transform(val => {
        if (!val || val === '') return null;
        return val;
      }),
    place_of_payment: z
      .enum(PLACE_OF_PAYMENT_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.PLACE_OF_PAYMENT.INVALID,
        }),
      })
      .optional()
      .nullable(),
    property_condition: z
      .enum(PROPERTY_CONDITION_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.PROPERTY_CONDITION.INVALID,
        }),
      })
      .optional()
      .nullable(),
    house_warranty: z.string().optional().nullable(),
    warranty_condition: z
      .string()
      .min(2, VALIDATION_MESSAGES.PROPERTY.WARRANTY_CONDITION.TOO_SHORT)
      .max(500, VALIDATION_MESSAGES.PROPERTY.WARRANTY_CONDITION.TOO_LONG)
      .trim()
      .optional()
      .nullable(),
    warranty_term: z
      .string()
      .min(2, VALIDATION_MESSAGES.PROPERTY.WARRANTY_TERM.TOO_SHORT)
      .max(100, VALIDATION_MESSAGES.PROPERTY.WARRANTY_TERM.TOO_LONG)
      .trim()
      .optional()
      .nullable(),
    furniture_included: z
      .enum(FURNITURE_INCLUDED_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.FURNITURE_INCLUDED.INVALID,
        }),
      })
      .optional()
      .nullable(),
    // Cost sharing fields
    transfer_fee: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.TRANSFER_FEE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    withholding_tax: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.WITHHOLDING_TAX.INVALID,
        }),
      })
      .optional()
      .nullable(),
    business_tax: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.BUSINESS_TAX.INVALID,
        }),
      })
      .optional()
      .nullable(),
    lease_registration_fee: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.LEASE_REGISTRATION_FEE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    mortgage_fee: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.MORTGAGE_FEE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    usufruct_registration_fee: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message:
            VALIDATION_MESSAGES.PROPERTY.USUFRUCT_REGISTRATION_FEE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    servitude_registration_fee: z
      .enum(COST_SHARING_TEXTS, {
        errorMap: () => ({
          message:
            VALIDATION_MESSAGES.PROPERTY.SERVITUDE_REGISTRATION_FEE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    declared_land_office_price: z
      .enum(DECLARED_LAND_OFFICE_PRICE_TEXTS, {
        errorMap: () => ({
          message:
            VALIDATION_MESSAGES.PROPERTY.DECLARED_LAND_OFFICE_PRICE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    // Documentation attachment fields
    land_title: z
      .enum(LAND_TITLE_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.LAND_TITLE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    land_title_document: z
      .string()
      .max(500, VALIDATION_MESSAGES.PROPERTY.LAND_TITLE_DOCUMENT.TOO_LONG)
      .optional()
      .nullable(),
    house_title: z
      .enum(HOUSE_TITLE_TEXTS, {
        errorMap: () => ({
          message: VALIDATION_MESSAGES.PROPERTY.HOUSE_TITLE.INVALID,
        }),
      })
      .optional()
      .nullable(),
    house_title_document: z
      .string()
      .max(500, VALIDATION_MESSAGES.PROPERTY.HOUSE_TITLE_DOCUMENT.TOO_LONG)
      .optional()
      .nullable(),
    house_registration_book: z
      .string()
      .max(500, VALIDATION_MESSAGES.PROPERTY.HOUSE_REGISTRATION_BOOK.TOO_LONG)
      .optional()
      .nullable(),
    land_lease_agreement: z
      .string()
      .max(500, VALIDATION_MESSAGES.PROPERTY.LAND_LEASE_AGREEMENT.TOO_LONG)
      .optional()
      .nullable(),
    is_active: z.boolean().optional().default(true),
  })
  .refine(
    data => {
      // If house_warranty is 'yes', warranty_condition and warranty_term are required
      if (data.house_warranty === 'yes') {
        return (
          data.warranty_condition &&
          data.warranty_condition.trim().length > 0 &&
          data.warranty_term &&
          data.warranty_term.trim().length > 0
        );
      }
      return true;
    },
    {
      message:
        'Warranty condition and warranty term are required when house warranty is yes',
      path: ['warranty_condition'],
    }
  )
  .refine(
    data => {
      // Additional check for warranty_term when house_warranty is 'yes'
      if (data.house_warranty === 'yes') {
        return data.warranty_term && data.warranty_term.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Warranty term is required when house warranty is yes',
      path: ['warranty_term'],
    }
  );

// Schema for property creation (client_id and property_name are required, others are optional)
export const CreatePropertySchema = PropertyValidationSchema;

// Schema for property updates (all fields optional except id)
export const UpdatePropertySchema = PropertyValidationSchema.partial();

// Search property validation schema
export const SearchPropertySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  is_active: z.boolean().optional(),
  created_by: z.number().int().optional(),
});

// Individual property validation functions
export const validateCreateProperty = data =>
  CreatePropertySchema.safeParse(data);
export const validateUpdateProperty = data =>
  UpdatePropertySchema.safeParse(data);
export const validateSearchProperty = data =>
  SearchPropertySchema.safeParse(data);

// Export schemas object for use in models
export const schemas = {
  create: CreatePropertySchema,
  update: UpdatePropertySchema,
  search: SearchPropertySchema,
};

// Default export
const Property = {
  schemas,
  validateCreateProperty,
  validateUpdateProperty,
  validateSearchProperty,
  CreatePropertySchema,
  UpdatePropertySchema,
  SearchPropertySchema,
};

export default Property;
