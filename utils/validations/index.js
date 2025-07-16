import * as UserValidation from './user.validation.js';
import * as ClientValidation from './client.validation.js';
import * as CommonValidation from './common.validation.js';

export const User = {
  schemas: {
    create: UserValidation.CreateUserSchema,
    update: UserValidation.UpdateUserSchema,
    login: UserValidation.LoginSchema,
    register: UserValidation.RegisterUserSchema,
    changePassword: UserValidation.ChangePasswordSchema,
    forgotPassword: UserValidation.ForgotPasswordSchema,
    resetPassword: UserValidation.ResetPasswordSchema,
    updateProfile: UserValidation.UpdateProfileSchema,
  },
  validate: {
    create: UserValidation.validateCreateUser,
    update: UserValidation.validateUpdateUser,
    login: UserValidation.validateLogin,
    register: UserValidation.validateRegister,
    changePassword: UserValidation.validateChangePassword,
    forgotPassword: UserValidation.validateForgotPassword,
    resetPassword: UserValidation.validateResetPassword,
    updateProfile: UserValidation.validateUpdateProfile,
  },
};

export const Client = {
  schemas: {
    create: ClientValidation.CreateClientSchema,
    update: ClientValidation.UpdateClientSchema,
    search: ClientValidation.ClientSearchSchema,
  },
  validate: {
    create: ClientValidation.validateCreateClient,
    update: ClientValidation.validateUpdateClient,
    search: ClientValidation.validateClientSearch,
  },
};

// Export all common validations
export const Common = {
  schemas: {
    id: CommonValidation.IdSchema,
    pagination: CommonValidation.PaginationSchema,
    search: CommonValidation.SearchSchema,
    dateRange: CommonValidation.DateRangeSchema,
  },
  validate: {
    id: CommonValidation.validateId,
    pagination: CommonValidation.validatePagination,
    search: CommonValidation.validateSearch,
    dateRange: CommonValidation.validateDateRange,
  },
};
