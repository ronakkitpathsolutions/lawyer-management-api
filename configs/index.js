import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://username:password@localhost:5432/database_name',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  HASH_SALT_ROUNDS: parseInt(process.env.HASH_SALT_ROUNDS, 10) || 10,

  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.example.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || 'user@example.com',
  SMTP_PASS: process.env.SMTP_PASS || 'your_smtp_password',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@example.com',
  SMTP_SECURE: process.env.SMTP_SECURE || false,

  // S3 Configuration
  // S3 Configuration
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'your-bucket-name',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || 'your-access-key',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || 'your-secret-key',
};
