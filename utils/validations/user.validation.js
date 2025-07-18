import { z } from 'zod';
import VALIDATION_MESSAGES from '../constants/messages.js';

// Base user validation schema
const UserValidationSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION_MESSAGES.USER.NAME.TOO_SHORT)
    .max(100, VALIDATION_MESSAGES.USER.NAME.TOO_LONG)
    .trim()
    .refine(val => val.length > 0, VALIDATION_MESSAGES.USER.NAME.EMPTY),
  email: z
    .string()
    .email(VALIDATION_MESSAGES.USER.EMAIL.INVALID)
    .max(150, VALIDATION_MESSAGES.USER.EMAIL.TOO_LONG)
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, VALIDATION_MESSAGES.USER.PASSWORD.TOO_SHORT)
    .max(255, VALIDATION_MESSAGES.USER.PASSWORD.TOO_LONG)
    .refine(val => val.length > 0, VALIDATION_MESSAGES.USER.PASSWORD.EMPTY),
  phone_number: z
    .string()
    .min(10, VALIDATION_MESSAGES.USER.PHONE_NUMBER.TOO_SHORT)
    .max(15, VALIDATION_MESSAGES.USER.PHONE_NUMBER.TOO_LONG)
    .refine(val => val.length > 0, VALIDATION_MESSAGES.USER.PHONE_NUMBER.EMPTY)
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      VALIDATION_MESSAGES.USER.PHONE_NUMBER.INVALID
    )
    .optional(),
  is_active: z.boolean().optional().default(false),
  role: z
    .string()
    .min(1, VALIDATION_MESSAGES.USER.ROLE.REQUIRED)
    .refine(
      val => ['admin', 'user'].includes(val),
      VALIDATION_MESSAGES.USER.ROLE.INVALID
    ),
  profile: z
    .string()
    .url(VALIDATION_MESSAGES.USER.PROFILE.INVALID_URL)
    .max(500, VALIDATION_MESSAGES.USER.PROFILE.TOO_LONG)
    .optional(),
});

// Schema for user creation (all required fields)
export const CreateUserSchema = UserValidationSchema;

// Schema for user updates (all fields optional)
export const UpdateUserSchema = UserValidationSchema.partial();

// Schema for login validation
export const LoginSchema = z.object({
  email: z
    .string({
      required_error: VALIDATION_MESSAGES.USER.EMAIL.REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.USER.EMAIL.REQUIRED,
    })
    .min(1, VALIDATION_MESSAGES.USER.EMAIL.REQUIRED)
    .email(VALIDATION_MESSAGES.USER.EMAIL.INVALID)
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
    })
    .min(1, VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED),
});

// Schema for password change
export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: VALIDATION_MESSAGES.USER.PASSWORD.CURRENT_REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.CURRENT_REQUIRED,
    })
    .min(1, VALIDATION_MESSAGES.USER.PASSWORD.CURRENT_REQUIRED),
  newPassword: z
    .string({
      required_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
      invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
    })
    .min(6, VALIDATION_MESSAGES.USER.PASSWORD.TOO_SHORT)
    .max(255, VALIDATION_MESSAGES.USER.PASSWORD.TOO_LONG),
});

// Schema for user registration
export const RegisterUserSchema = z
  .object({
    name: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.NAME.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.NAME.REQUIRED,
      })
      .min(2, VALIDATION_MESSAGES.USER.NAME.TOO_SHORT)
      .max(100, VALIDATION_MESSAGES.USER.NAME.TOO_LONG)
      .trim(),
    email: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.EMAIL.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.EMAIL.REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.USER.EMAIL.REQUIRED)
      .email(VALIDATION_MESSAGES.USER.EMAIL.INVALID)
      .max(150, VALIDATION_MESSAGES.USER.EMAIL.TOO_LONG)
      .toLowerCase()
      .trim(),
    password: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
      })
      .min(6, VALIDATION_MESSAGES.USER.PASSWORD.TOO_SHORT)
      .max(255, VALIDATION_MESSAGES.USER.PASSWORD.TOO_LONG),
    confirmPassword: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED),
    role: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.ROLE.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.ROLE.REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.USER.ROLE.REQUIRED)
      .refine(
        val => ['admin', 'user'].includes(val),
        VALIDATION_MESSAGES.USER.ROLE.INVALID
      ),
    is_active: z.boolean().optional().default(false), // Default to false for new registrations
  })
  .refine(data => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.USER.PASSWORD.MISMATCH,
    path: ['confirmPassword'],
  });

// Schema for forgot password
export const ForgotPasswordSchema = z
  .object({
    email: z
      .string({
        required_error: VALIDATION_MESSAGES.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.REQUIRED)
      .email(VALIDATION_MESSAGES.USER.EMAIL.INVALID)
      .trim()
      .toLowerCase(),
  })
  .strict();

// Schema for reset password
export const ResetPasswordSchema = z
  .object({
    refresh_token: z
      .string({
        required_error: VALIDATION_MESSAGES.AUTH.RESET.TOKEN_REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.AUTH.RESET.TOKEN_REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.AUTH.RESET.TOKEN_REQUIRED),
    newPassword: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
      })
      .min(6, VALIDATION_MESSAGES.USER.PASSWORD.TOO_SHORT)
      .max(255, VALIDATION_MESSAGES.USER.PASSWORD.TOO_LONG),
    confirmPassword: z
      .string({
        required_error: VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED,
        invalid_type_error: VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED,
      })
      .min(1, VALIDATION_MESSAGES.USER.PASSWORD.CONFIRM_REQUIRED),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.USER.PASSWORD.MISMATCH,
    path: ['confirmPassword'],
  });

// Schema for profile update
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION_MESSAGES.USER.NAME.TOO_SHORT)
    .max(100, VALIDATION_MESSAGES.USER.NAME.TOO_LONG)
    .trim()
    .optional(),
  profile: z
    .string()
    .max(500, VALIDATION_MESSAGES.USER.PROFILE.TOO_LONG)
    .optional(),
  phone_number: z
    .string()
    .min(10, VALIDATION_MESSAGES.USER.PHONE_NUMBER.TOO_SHORT)
    .max(15, VALIDATION_MESSAGES.USER.PHONE_NUMBER.TOO_LONG)
    .refine(val => val.length > 0, VALIDATION_MESSAGES.USER.PHONE_NUMBER.EMPTY)
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      VALIDATION_MESSAGES.USER.PHONE_NUMBER.INVALID
    )
    .optional(),
});

export const validateCreateUser = data => CreateUserSchema.safeParse(data);
export const validateUpdateUser = data => UpdateUserSchema.safeParse(data);
export const validateLogin = data => LoginSchema.safeParse(data);
export const validateRegister = data => RegisterUserSchema.safeParse(data);
export const validateChangePassword = data =>
  ChangePasswordSchema.safeParse(data);
export const validateForgotPassword = data =>
  ForgotPasswordSchema.safeParse(data);
export const validateResetPassword = data =>
  ResetPasswordSchema.safeParse(data);
export const validateUpdateProfile = data =>
  UpdateProfileSchema.safeParse(data);
