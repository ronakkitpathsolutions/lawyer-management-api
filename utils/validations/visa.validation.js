import { z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';
import { EXISTING_VISA, WISHED_VISA } from '../constants/variables.js';

// Base visa validation schema
const VisaValidationSchema = z.object({
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
          required_error: VALIDATION_MESSAGES.VISA.CLIENT_ID.REQUIRED,
          invalid_type_error: VALIDATION_MESSAGES.VISA.CLIENT_ID.INVALID,
        })
        .int(VALIDATION_MESSAGES.VISA.CLIENT_ID.INVALID)
        .positive(VALIDATION_MESSAGES.VISA.CLIENT_ID.INVALID)
    ),
  existing_visa: z.enum(EXISTING_VISA).optional().nullable(),
  wished_visa: z.enum(WISHED_VISA, {
    required_error: VALIDATION_MESSAGES.VISA.WISHED_VISA.REQUIRED,
    invalid_type_error: VALIDATION_MESSAGES.VISA.WISHED_VISA.INVALID,
  }),
  latest_entry_date: z
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
      VALIDATION_MESSAGES.VISA.LATEST_ENTRY_DATE.INVALID
    ),
  existing_visa_expiry: z
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
      VALIDATION_MESSAGES.VISA.EXISTING_VISA_EXPIRY.INVALID
    ),
  intended_departure_date: z
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
      VALIDATION_MESSAGES.VISA.INTENDED_DEPARTURE_DATE.INVALID
    ),
});

// Create visa validation schema
export const CreateVisaSchema = VisaValidationSchema.omit({});

// Update visa validation schema
export const UpdateVisaSchema = VisaValidationSchema.partial();

// Search visa validation schema
export const SearchVisaSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  client_id: z.number().int().optional(),
  existing_visa: z.enum(EXISTING_VISA).optional(),
  wished_visa: z.enum(WISHED_VISA).optional(),
  is_active: z.boolean().optional(),
  sortBy: z
    .enum([
      'id',
      'client_id',
      'existing_visa',
      'wished_visa',
      'latest_entry_date',
      'existing_visa_expiry',
      'intended_departure_date',
      'created_by',
      'is_active',
      'createdAt',
      'updatedAt',
    ])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  created_by: z.number().int().optional(),
});

// ID validation schema
export const VisaIdSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val))
    .refine(
      val => !isNaN(val) && val > 0,
      VALIDATION_MESSAGES.COMMON.ID.INVALID
    ),
});

// Validation functions
export const validateCreateVisa = data => CreateVisaSchema.safeParse(data);
export const validateUpdateVisa = data => UpdateVisaSchema.safeParse(data);
export const validateVisaSearch = data => SearchVisaSchema.safeParse(data);
export const validateVisaId = data => VisaIdSchema.safeParse(data);

// Export schemas object for use in models
export const schemas = {
  create: CreateVisaSchema,
  update: UpdateVisaSchema,
  search: SearchVisaSchema,
  id: VisaIdSchema,
};

// Default export
const Visa = {
  schemas,
  validateCreateVisa,
  validateUpdateVisa,
  validateVisaSearch,
  validateVisaId,
  CreateVisaSchema,
  UpdateVisaSchema,
  SearchVisaSchema,
  VisaIdSchema,
};

export default Visa;
