import express from 'express';
import {
  changePassword,
  forgotPassword,
  login,
  register,
  resendVerification,
  resetPassword,
  verifyUser,
} from '../controllers/auth.controller.js';
import {
  authenticateToken,
  changePasswordValidationMiddleware,
  forgotPasswordValidationMiddleware,
  loginValidationMiddleware,
  registerValidationMiddleware,
  resendVerificationValidationMiddleware,
  resetPasswordValidationMiddleware,
  validateLoginRole,
} from '../middlewares/auth.middleware.js';

const authRoutes = express.Router();

authRoutes.post('/login', loginValidationMiddleware, validateLoginRole, login);
authRoutes.post('/register', registerValidationMiddleware, register);
authRoutes.get('/verify', verifyUser);
authRoutes.post(
  '/forgot-password',
  forgotPasswordValidationMiddleware,
  forgotPassword
);
authRoutes.post(
  '/reset-password',
  resetPasswordValidationMiddleware,
  resetPassword
);
authRoutes.post(
  '/resend-verification',
  resendVerificationValidationMiddleware,
  resendVerification
);
authRoutes.post(
  '/change-password',
  authenticateToken,
  changePasswordValidationMiddleware,
  changePassword
);

export default authRoutes;
