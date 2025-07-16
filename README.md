# Lawyer Dashboard API

A Node.js REST API server with user authentication and CRUD operations built with Express.js, Sequelize ORM, and PostgreSQL.

## Features

- **User Authentication**: Registration, login, email verification, password reset
- **JWT Token-based Authentication**: Secure API access with JWT tokens
- **Input Validation**: Comprehensive validation using Zod schemas
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Email Service**: Nodemailer integration for verification emails
- **Database**: PostgreSQL with Sequelize ORM
- **Error Handling**: Centralized error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Email**: Nodemailer
- **Environment**: dotenv

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd lawyer-dashboard-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lawyer_dashboard
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
HASH_SALT_ROUNDS=12
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

4. Set up your PostgreSQL database and update the connection details in your `.env` file.

5. Run the server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register User

- **URL**: `POST /api/auth/register`
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "client"
}
```

- **Response**: JWT token and success message
- **Note**: User account starts as inactive until email verification

#### 2. Login

- **URL**: `POST /api/auth/login`
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

- **Response**: JWT token on successful login
- **Note**: Only active users can login

#### 3. Verify Email

- **URL**: `GET /api/auth/verify?refresh_token=<token>`
- **Description**: Activates user account via email verification link

#### 4. Forgot Password

- **URL**: `POST /api/auth/forgot-password`
- **Body**:

```json
{
  "email": "john@example.com"
}
```

- **Response**: Password reset email sent

#### 5. Reset Password

- **URL**: `POST /api/auth/reset-password`
- **Body**:

```json
{
  "refresh_token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### 6. Resend Verification Email

- **URL**: `POST /api/auth/resend-verification`
- **Body**:

```json
{
  "email": "john@example.com"
}
```

## User Roles

- **client**: Regular user with basic access
- **admin**: Administrative user with elevated permissions

## Validation Rules

### User Registration

- **Name**: 2-100 characters, required
- **Email**: Valid email format, unique, required
- **Password**: Minimum 6 characters, required
- **Role**: Must be either "client" or "admin", required
- **Confirm Password**: Must match password, required

### User Login

- **Email**: Valid email format, required
- **Password**: Required

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (if available)"
}
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Development

### Scripts

- `npm run dev`: Start development server with auto-restart
- `npm start`: Start production server

### Project Structure

```
├── configs/           # Database and environment configuration
├── controllers/       # Route controllers
├── middlewares/       # Authentication and validation middlewares
├── models/           # Sequelize models
├── routes/           # API route definitions
├── utils/            # Utility functions and helpers
│   ├── constants/    # Application constants and messages
│   └── validations/  # Zod validation schemas
├── index.js          # Application entry point
└── package.json      # Dependencies and scripts
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (account not activated)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `500`: Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the ISC License.
