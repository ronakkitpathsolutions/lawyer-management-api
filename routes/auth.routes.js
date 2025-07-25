import express from 'express';
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  register,
  resendVerification,
  resetPassword,
  updateProfile,
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
  updateProfileValidationMiddleware,
  validateLoginRole,
} from '../middlewares/auth.middleware.js';
import {
  uploadProfileImageToS3,
  handleS3UploadError,
} from '../middlewares/s3.middleware.js';

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
authRoutes.get('/profile', authenticateToken, getProfile);
authRoutes.put(
  '/profile',
  authenticateToken,
  uploadProfileImageToS3,
  updateProfileValidationMiddleware,
  handleS3UploadError,
  updateProfile
);

export default authRoutes;
