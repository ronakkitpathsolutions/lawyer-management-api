import { z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';
import { RELATIONSHIP_TEXTS } from '../constants/variables.js';

// Base relationship validation schema
const RelationshipValidationSchema = z.object({
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
          required_error: VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.REQUIRED,
          invalid_type_error:
            VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.INVALID,
        })
        .int(VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.INVALID)
        .positive(VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.INVALID)
    ),
  member_name: z
    .string({
      required_error: VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.INVALID,
    })
    .min(2, VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.TOO_SHORT)
    .max(100, VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.TOO_LONG)
    .trim(),
  member_email: z
    .string({
      required_error: VALIDATION_MESSAGES.CLIENT.EMAIL.REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.CLIENT.EMAIL.INVALID,
    })
    .email(VALIDATION_MESSAGES.CLIENT.EMAIL.INVALID)
    .max(150, VALIDATION_MESSAGES.CLIENT.EMAIL.TOO_LONG)
    .toLowerCase()
    .trim(),
  relationship: z.enum(RELATIONSHIP_TEXTS, {
    invalid_type_error: VALIDATION_MESSAGES.RELATIONSHIP.RELATIONSHIP.INVALID,
  }),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.CLIENT.DOB.INVALID)
    .refine(val => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, VALIDATION_MESSAGES.CLIENT.DOB.FUTURE_DATE)
    .optional()
    .nullable(),
  contact_number: z
    .string()
    .min(10, VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.TOO_SHORT)
    .max(15, VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.TOO_LONG)
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.INVALID
    ),
  nationality: z
    .string()
    .min(2, VALIDATION_MESSAGES.CLIENT.NATIONALITY.INVALID)
    .max(50, VALIDATION_MESSAGES.CLIENT.NATIONALITY.INVALID)
    .trim()
    .refine(
      val => val.length > 0,
      VALIDATION_MESSAGES.CLIENT.NATIONALITY.REQUIRED
    ),
  passport_number: z
    .string()
    .min(6, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.TOO_SHORT)
    .max(20, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.TOO_LONG)
    .regex(/^[A-Z0-9]+$/, VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.INVALID)
    .transform(val => val.toUpperCase())
    .optional()
    .nullable(),
  has_yellow_or_pink_card: z
    .boolean({
      errorMap: () => ({
        message: VALIDATION_MESSAGES.CLIENT.HAS_CARD.INVALID,
      }),
    })
    .optional()
    .nullable(),
  has_bought_property_in_thailand: z
    .boolean({
      errorMap: () => ({
        message: VALIDATION_MESSAGES.CLIENT.HAS_PROPERTY.INVALID,
      }),
    })
    .optional()
    .nullable(),
});

// Create relationship validation schema
export const CreateRelationshipSchema = RelationshipValidationSchema.omit({});

// Update relationship validation schema
export const UpdateRelationshipSchema = RelationshipValidationSchema.partial();

// Search relationship validation schema
export const SearchRelationshipSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  client_id: z.number().int().optional(),
  relationship: z.enum(RELATIONSHIP_TEXTS).optional(),
  member_name: z.string().trim().optional(),
  member_email: z
    .string()
    .email(VALIDATION_MESSAGES.CLIENT.EMAIL.INVALID)
    .optional(),
  sortBy: z
    .enum([
      'id',
      'member_name',
      'member_email',
      'relationship',
      'createdAt',
      'updatedAt',
    ])
    .optional()
    .default('id'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// ID validation schema
export const RelationshipIdSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val))
    .refine(
      val => !isNaN(val) && val > 0,
      VALIDATION_MESSAGES.COMMON.ID.INVALID
    ),
});

// Validation functions
export const validateCreateRelationship = data =>
  CreateRelationshipSchema.safeParse(data);
export const validateUpdateRelationship = data =>
  UpdateRelationshipSchema.safeParse(data);
export const validateSearchRelationship = data =>
  SearchRelationshipSchema.safeParse(data);
export const validateRelationshipId = data =>
  RelationshipIdSchema.safeParse(data);

// Export schemas object for use in models
export const schemas = {
  create: CreateRelationshipSchema,
  update: UpdateRelationshipSchema,
  search: SearchRelationshipSchema,
  id: RelationshipIdSchema,
};

// Default export
const Relationship = {
  schemas,
  validateCreateRelationship,
  validateUpdateRelationship,
  validateSearchRelationship,
  validateRelationshipId,
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
  SearchRelationshipSchema,
  RelationshipIdSchema,
};

export default Relationship;
