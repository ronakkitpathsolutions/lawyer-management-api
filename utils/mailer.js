import nodemailer from 'nodemailer';
import { ENV } from '../configs/index.js';
import VALIDATION_MESSAGES from './constants/messages.js';

export const sendEmail = async ({ to, subject, html }) => {
  // Configure your SMTP transport here
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    // Make sure 'secure' matches your SMTP port:
    // - secure: true for port 465 (SSL)
    // - secure: false for port 587 (STARTTLS)
    secure: false,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: ENV.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    html,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    // Optionally, you can throw a custom error or return a user-friendly message
    throw new Error(VALIDATION_MESSAGES.SYSTEM.SERVER_ERROR);
  }
};
