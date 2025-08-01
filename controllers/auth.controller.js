import { createApiResponse, asyncHandler } from '../utils/helper.js';
import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { generateRefreshToken } from '../utils/refresh-token.js';
import { sendEmail } from '../utils/mailer.js';
import { deleteS3File } from '../utils/s3-helper.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';

// Change password for authenticated user
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedData;
  const userId = req.user.id;

  // Find user by id
  const user = await User.findByPk(userId);
  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.NOT_FOUND)
      );
  }

  // Validate current password
  const isPasswordValid = await user.validatePassword(currentPassword);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.PASSWORD.INCORRECT)
      );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(createApiResponse(true, 'Password changed successfully'));
}, 'Failed to change password');

export const login = asyncHandler(async (req, res) => {
  // Get validated data from middleware
  const { password } = req.validatedData;

  // Get user from role validation middleware
  const user = req.foundUser;

  // 4. Check if user is active
  if (!user.is_active) {
    return res
      .status(403)
      .json(
        createApiResponse(
          false,
          'Account is not activated. Please verify your email.'
        )
      );
  }

  // 5. Validate password
  const isPasswordValid = await user.validatePassword(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(createApiResponse(false, VALIDATION_MESSAGES.AUTH.LOGIN.FAILED));
  }

  // 6. Generate JWT token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };

  const token = generateToken(tokenPayload);

  // 7. Return success response with token
  return res
    .status(200)
    .json(createApiResponse(true, 'Login successful', token));
}, VALIDATION_MESSAGES.AUTH.LOGIN.FAILED);

export const register = asyncHandler(async (req, res) => {
  // Get validated data from middleware
  const { email } = req.validatedData;
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res
      .status(409)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.AUTH.REGISTER.EMAIL_EXISTS)
      );
  }

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  // Create user (Zod + Sequelize hooks will handle password hash, etc.)
  const user = await User.create({
    ...req.validatedData,
    refresh_token: refreshToken,
  });

  // Send verification email
  const verificationUrl = `https://guest-assessment.project-demo.info/verify?refresh_token=${refreshToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your account',
    html: `<p>Click <a target="_blank" href="${verificationUrl}">here</a> to verify your account.</p>`,
  });

  // Generate JWT token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };

  const token = generateToken(tokenPayload);

  // Return success response with token
  return res
    .status(201)
    .json(
      createApiResponse(
        true,
        'Registration successful. Please check your email to verify your account.',
        token
      )
    );
}, VALIDATION_MESSAGES.AUTH.REGISTER.FAILED);

export const forgotPassword = asyncHandler(async (req, res) => {
  // Get validated data from middleware
  const { email } = req.validatedData;
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (!existingUser) {
    return res
      .status(404)
      .json(createApiResponse(false, VALIDATION_MESSAGES.USER.EMAIL.NOT_FOUND));
  }

  // Generate new refresh token
  const refreshToken = generateRefreshToken();
  await existingUser.update({ refresh_token: refreshToken });
  // Send reset password email
  const resetUrl = `https://guest-assessment.project-demo.info/reset-password?refresh_token=${refreshToken}`;
  await sendEmail({
    to: existingUser.email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });
  return res
    .status(200)
    .json(createApiResponse(true, 'Password reset email sent successfully'));
}, 'Failed to send password reset email');

export const resetPassword = asyncHandler(async (req, res) => {
  // Get validated data from middleware
  const { refresh_token, newPassword } = req.validatedData;

  // Find user by refresh token
  const user = await User.findOne({ where: { refresh_token } });
  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.AUTH.RESET.TOKEN_INVALID)
      );
  }

  // Update user's password
  user.password = newPassword;
  user.refresh_token = null;
  await user.save();

  // Generate JWT token
  const userWithRole = await User.findByEmail(user.email);
  const tokenPayload = {
    id: userWithRole.id,
    email: userWithRole.email,
    role: userWithRole.role?.name,
    is_active: userWithRole.is_active,
  };

  const token = generateToken(tokenPayload);

  return res
    .status(200)
    .json(createApiResponse(true, 'Password reset successful', token));
}, VALIDATION_MESSAGES.AUTH.RESET.FAILED);

export const getUserProfile = asyncHandler(async (req, res) => {
  // Get user ID from authentication middleware
  const userId = req.user.id;

  // Fetch user with role information
  const user = await User.findByPk(userId);

  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.NOT_FOUND)
      );
  }

  return res
    .status(200)
    .json(createApiResponse(true, 'User profile retrieved successfully', user));
}, 'Failed to fetch user profile');

export const verifyUser = asyncHandler(async (req, res) => {
  const { refresh_token } = req.query;

  if (!refresh_token) {
    return res
      .status(400)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.AUTH.RESET.TOKEN_REQUIRED)
      );
  }

  // Find user by refresh token
  const user = await User.findOne({ where: { refresh_token } });

  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.AUTH.RESET.TOKEN_INVALID)
      );
  }

  // Update user to be active and clear refresh token
  await user.update({ is_active: true, refresh_token: null });
  const userWithRole = await User.findByEmail(user.email);

  // Generate JWT token
  const tokenPayload = {
    id: userWithRole.id,
    email: userWithRole.email,
    role: userWithRole.role,
    is_active: userWithRole.is_active,
  };

  const verifiedToken = generateToken(tokenPayload);

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        'User verified successfully. Account is now active.',
        verifiedToken
      )
    );
}, 'Verification failed');

export const resendVerification = asyncHandler(async (req, res) => {
  // Get validated data from middleware
  const { email } = req.validatedData;
  const user = await User.findByEmail(email);
  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.NOT_FOUND)
      );
  }
  if (user.is_active) {
    return res
      .status(400)
      .json(createApiResponse(false, 'User is already verified'));
  }
  // Generate new refresh token
  const refreshToken = generateRefreshToken();
  await user.update({ refresh_token: refreshToken });
  // Send verification email
  const verificationUrl = `https://guest-assessment.project-demo.info/verify?refresh_token=${refreshToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your account',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your account.</p>`,
  });
  return res
    .status(200)
    .json(createApiResponse(true, 'Verification email sent successfully'));
}, 'Failed to resend verification');

// Get user profile for authenticated user
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find user by id and get full profile
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refresh_token'] }, // Exclude sensitive data
  });

  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.NOT_FOUND)
      );
  }

  return res
    .status(200)
    .json(createApiResponse(true, 'Profile retrieved successfully', user));
}, 'Failed to get profile');

// Update user profile for authenticated user
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone_number } = req.validatedData || {};
  const userId = req.user.id;

  // Find user by id
  const user = await User.findByPk(userId);
  if (!user) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.USER.GENERAL.NOT_FOUND)
      );
  }

  // Handle profile image from S3 upload
  let profileImageUrl = user.profile; // Keep existing profile if no new image

  if (req.file) {
    // New profile image uploaded to S3
    profileImageUrl = req.file.location; // S3 URL from multer-s3

    // Delete old S3 image if user had one
    if (user.profile && user.profile !== profileImageUrl) {
      try {
        await deleteS3File(user.profile);
      } catch (error) {
        console.warn(
          'Failed to delete old profile image from S3:',
          error.message
        );
        // Continue with update even if old image deletion fails
      }
    }
  }

  // Update only the fields that were provided
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (phone_number !== undefined) updateData.phone_number = phone_number;
  if (profileImageUrl !== undefined) updateData.profile = profileImageUrl;

  // Update user profile
  await user.update(updateData);

  // Return updated user profile (excluding sensitive data)
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refresh_token'] },
  });

  return res
    .status(200)
    .json(createApiResponse(true, 'Profile updated successfully', updatedUser));
}, 'Failed to update profile');
