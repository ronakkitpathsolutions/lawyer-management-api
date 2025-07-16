import { z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';

// Base client validation schema
const ClientValidationSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION_MESSAGES.CLIENT.NAME.TOO_SHORT)
    .max(100, VALIDATION_MESSAGES.CLIENT.NAME.TOO_LONG)
    .trim()
    .refine(val => val.length > 0, VALIDATION_MESSAGES.CLIENT.NAME.EMPTY),
  family_name: z
    .string()
    .min(2, VALIDATION_MESSAGES.CLIENT.FAMILY_NAME.TOO_SHORT)
    .max(100, VALIDATION_MESSAGES.CLIENT.FAMILY_NAME.TOO_LONG)
    .trim()
    .refine(
      val => val.length > 0,
      VALIDATION_MESSAGES.CLIENT.FAMILY_NAME.EMPTY
    ),
  email: z
    .string()
    .email(VALIDATION_MESSAGES.CLIENT.EMAIL.INVALID)
    .max(150, VALIDATION_MESSAGES.CLIENT.EMAIL.TOO_LONG)
    .toLowerCase()
    .trim(),
  passport_number: z
    .string()
    .min(6, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.TOO_SHORT)
    .max(20, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.TOO_LONG)
    .regex(/^[A-Z0-9]+$/, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.INVALID)
    .transform(val => val.toUpperCase())
    .optional()
    .nullable(),
  nationality: z
    .string()
    .min(2, VALIDATION_MESSAGES.CLIENT.NATIONALITY.INVALID)
    .max(50, VALIDATION_MESSAGES.CLIENT.NATIONALITY.INVALID)
    .trim()
    .refine(
      val => val.length > 0,
      VALIDATION_MESSAGES.CLIENT.NATIONALITY.REQUIRED
    ),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.CLIENT.DOB.INVALID)
    .refine(val => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, VALIDATION_MESSAGES.CLIENT.DOB.FUTURE_DATE)
    .refine(val => {
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 18;
    }, VALIDATION_MESSAGES.CLIENT.AGE.TOO_YOUNG)
    .optional()
    .nullable(),
  age: z
    .number()
    .int(VALIDATION_MESSAGES.CLIENT.AGE.INVALID)
    .min(18, VALIDATION_MESSAGES.CLIENT.AGE.TOO_YOUNG)
    .max(120, VALIDATION_MESSAGES.CLIENT.AGE.TOO_OLD)
    .optional(), // This will be calculated from date_of_birth
  phone_number: z
    .string()
    .min(10, VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.TOO_SHORT)
    .max(15, VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.TOO_LONG)
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.INVALID
    ),
  current_address: z
    .string()
    .min(10, VALIDATION_MESSAGES.CLIENT.CURRENT_ADDRESS.TOO_SHORT)
    .max(500, VALIDATION_MESSAGES.CLIENT.CURRENT_ADDRESS.TOO_LONG)
    .trim(),
  address_in_thailand: z
    .string()
    .max(500, VALIDATION_MESSAGES.CLIENT.ADDRESS_IN_THAILAND.TOO_LONG)
    .trim()
    .optional()
    .nullable(),
  whatsapp: z
    .string()
    .min(10, VALIDATION_MESSAGES.CLIENT.WHATSAPP.INVALID_LENGTH)
    .max(15, VALIDATION_MESSAGES.CLIENT.WHATSAPP.INVALID_LENGTH)
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      VALIDATION_MESSAGES.CLIENT.WHATSAPP.INVALID
    )
    .optional()
    .nullable(),
  line: z
    .string()
    .min(3, VALIDATION_MESSAGES.CLIENT.LINE.INVALID_LENGTH)
    .max(50, VALIDATION_MESSAGES.CLIENT.LINE.INVALID_LENGTH)
    .trim()
    .optional()
    .nullable(),
  is_active: z.boolean().optional().default(true),
});

// Schema for client creation (all required fields)
export const CreateClientSchema = ClientValidationSchema.omit({ age: true });

// Schema for client updates (all fields optional except id)
export const UpdateClientSchema = ClientValidationSchema.partial();

// Schema for client search/filter
export const ClientSearchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  nationality: z.string().optional(),
  is_active: z.boolean().optional(),
  created_by: z.number().int().optional(),
});

// Individual validation functions
export const validateCreateClient = data => CreateClientSchema.safeParse(data);
export const validateUpdateClient = data => UpdateClientSchema.safeParse(data);
export const validateClientSearch = data => ClientSearchSchema.safeParse(data);

// Export schemas object for use in models
export const schemas = {
  create: CreateClientSchema,
  update: UpdateClientSchema,
  search: ClientSearchSchema,
};

// Default export
const Client = {
  schemas,
  validateCreateClient,
  validateUpdateClient,
  validateClientSearch,
  CreateClientSchema,
  UpdateClientSchema,
  ClientSearchSchema,
};

export default Client;
