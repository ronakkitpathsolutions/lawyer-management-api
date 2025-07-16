import { z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';

// Common ID validation
export const IdSchema = z
  .number()
  .int(VALIDATION_MESSAGES.COMMON.ID.INVALID)
  .positive(VALIDATION_MESSAGES.COMMON.ID.POSITIVE);

// Common pagination schema
export const PaginationSchema = z.object({
  page: z
    .number()
    .int(VALIDATION_MESSAGES.COMMON.PAGINATION.PAGE_INVALID)
    .positive(VALIDATION_MESSAGES.COMMON.PAGINATION.PAGE_INVALID)
    .default(1),
  limit: z
    .number()
    .int(VALIDATION_MESSAGES.COMMON.PAGINATION.LIMIT_INVALID)
    .positive(VALIDATION_MESSAGES.COMMON.PAGINATION.LIMIT_INVALID)
    .max(100, VALIDATION_MESSAGES.COMMON.PAGINATION.LIMIT_EXCEEDED)
    .default(10),
  offset: z
    .number()
    .int(VALIDATION_MESSAGES.COMMON.PAGINATION.OFFSET_INVALID)
    .min(0, VALIDATION_MESSAGES.COMMON.PAGINATION.OFFSET_INVALID)
    .optional(),
});

// Common search schema
export const SearchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, VALIDATION_MESSAGES.COMMON.SEARCH.QUERY_EMPTY)
    .max(255, VALIDATION_MESSAGES.COMMON.SEARCH.QUERY_TOO_LONG)
    .optional(),
  fields: z.array(z.string()).optional(),
  sort: z.string().optional(),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc']).default('ASC').optional(),
});

// Common date range schema
export const DateRangeSchema = z
  .object({
    startDate: z
      .string()
      .datetime(VALIDATION_MESSAGES.COMMON.DATE.INVALID_FORMAT)
      .or(z.date())
      .optional(),
    endDate: z
      .string()
      .datetime(VALIDATION_MESSAGES.COMMON.DATE.INVALID_FORMAT)
      .or(z.date())
      .optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: VALIDATION_MESSAGES.COMMON.DATE.START_AFTER_END,
      path: ['endDate'],
    }
  );

// Validation helper functions
export const validateId = data => IdSchema.safeParse(data);
export const validatePagination = data => PaginationSchema.safeParse(data);
export const validateSearch = data => SearchSchema.safeParse(data);
export const validateDateRange = data => DateRangeSchema.safeParse(data);
