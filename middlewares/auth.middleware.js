import User from '../models/user.model.js';
import { createValidationMiddleware } from './validation.middleware.js';
import { verifyToken } from '../utils/jwt.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { asyncHandler, createApiResponse } from '../utils/helper.js';

// Auth validation middlewares
export const loginValidationMiddleware = createValidationMiddleware(
  User.validateLoginData
);

export const registerValidationMiddleware = createValidationMiddleware(
  User.validateRegisterData
);

export const forgotPasswordValidationMiddleware = createValidationMiddleware(
  User.validateForgotPassword
);

export const resetPasswordValidationMiddleware = createValidationMiddleware(
  User.validateResetPassword
);

export const updateProfileValidationMiddleware = createValidationMiddleware(
  User.validateUpdateProfile
);

export const changePasswordValidationMiddleware = createValidationMiddleware(
  User.validatePasswordChange
);

export const resendVerificationValidationMiddleware =
  createValidationMiddleware(
    User.validateForgotPassword // Uses same validation as forgot password (just email)
  );

// JWT Authentication middleware
export const authenticateToken = asyncHandler(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: VALIDATION_MESSAGES.AUTH.TOKEN.REQUIRED,
    });
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: VALIDATION_MESSAGES.AUTH.TOKEN.MALFORMED,
    });
  }

  // Extract token from Bearer format
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    return res.status(401).json({
      success: false,
      message: VALIDATION_MESSAGES.AUTH.TOKEN.REQUIRED,
    });
  }

  // Verify and decode token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    // Handle JWT specific errors with appropriate status codes
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }

    // Handle other JWT errors (invalid token, malformed, etc.)
    return res.status(401).json({
      success: false,
      message: error.message || VALIDATION_MESSAGES.AUTH.TOKEN.INVALID,
    });
  }

  // Check if user exists and is active
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found',
    });
  }

  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'User account is not active',
    });
  }

  // Add user information to request object
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };

  req.token = token;
  next();
}, 'Authentication error');

// Login role validation middleware
export const validateLoginRole = asyncHandler(async (req, res, next) => {
  const { email } = req.validatedData;

  // Find user by email
  const user = await User.findByEmail(email);

  if (!user) {
    return res
      .status(401)
      .json(createApiResponse(false, VALIDATION_MESSAGES.AUTH.LOGIN.FAILED));
  }

  // Check if user role is allowed to login (only admin and user)
  if (!['admin', 'user'].includes(user.role)) {
    return res
      .status(403)
      .json(
        createApiResponse(
          false,
          'Access denied. Only admin and user accounts can login.'
        )
      );
  }

  // Add user to request for next middleware/controller
  req.foundUser = user;
  next();
}, 'Role validation failed');
