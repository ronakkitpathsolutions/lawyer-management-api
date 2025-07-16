# Lawyer Dashboard API

A Node.js REST API server with separated User and Client management, authentication, and CRUD operations built with Express.js, Sequelize ORM, and PostgreSQL.

## Features

- **Separated User and Client Models**: Users (admin/user) for authentication, Clients for data management
- **Role-Based Access Control**: Only admin and user roles can login; clients are managed by admins
- **User Authentication**: Registration, login, email verification, password reset for admin/user roles
- **Client Management**: Complete CRUD operations for client data (admin only)
- **JWT Token-based Authentication**: Secure API access with JWT tokens
- **Input Validation**: Comprehensive validation using Zod schemas
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Email Service**: Nodemailer integration for verification emails
- **Database**: PostgreSQL with Sequelize ORM
- **Error Handling**: Centralized error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled

## Models

### User Model

- **Purpose**: Authentication and system access
- **Roles**: admin, user (client role removed)
- **Fields**: id, name, email, password, phone_number, is_active, role, refresh_token, timestamps
- **Removed Fields**: passport_number, nationality, date_of_birth (moved to Client model)

### Client Model

- **Purpose**: Client data management (managed by admins)
- **Fields**:
  - Basic Info: id, name, family_name, email
  - Identity: passport_number, nationality, date_of_birth, age
  - Contact: phone_number, current_address, address_in_thailand (optional)
  - Social: whatsapp (optional), line (optional)
  - Status: is_active, created_by, timestamps

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

5. Run database migration to update schema:

```bash
npm run migrate-schema
```

6. Create an admin user:

```bash
npm run create-admin
```

7. Run the server:

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

### Authentication Endpoints (For Admin and User roles only)

#### 1. Register User

- **URL**: `POST /api/auth/register`
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "user"
}
```

- **Response**: JWT token and success message
- **Note**: User account starts as inactive until email verification
- **Allowed Roles**: admin, user (client role removed)

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
- **Note**: Only active users with admin or user roles can login

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

### Client Management Endpoints (Admin Only)

All client endpoints require admin authentication.

#### 1. Create Client

- **URL**: `POST /api/clients`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Body**:

```json
{
  "name": "Jane",
  "family_name": "Smith",
  "email": "jane.smith@example.com",
  "passport_number": "AB123456",
  "nationality": "American",
  "date_of_birth": "1990-05-15",
  "phone_number": "+1234567890",
  "current_address": "123 Main St, City, Country",
  "address_in_thailand": "456 Thai St, Bangkok, Thailand",
  "whatsapp": "+1234567890",
  "line": "jane_line_id"
}
```

#### 2. Get All Clients

- **URL**: `GET /api/clients`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `search`: Search term (searches name, family_name, email, passport_number, nationality)
  - `sortBy`: Sort field (default: createdAt)
  - `sortOrder`: ASC or DESC (default: DESC)
  - `nationality`: Filter by nationality
  - `is_active`: Filter by active status (true/false)
  - `created_by`: Filter by creator user ID

#### 3. Get Client by ID

- **URL**: `GET /api/clients/:id`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`

#### 4. Update Client

- **URL**: `PUT /api/clients/:id`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Body**: Same as create client (all fields optional)

#### 5. Delete Client

- **URL**: `DELETE /api/clients/:id`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`

#### 6. Toggle Client Status

- **URL**: `PATCH /api/clients/:id/toggle-status`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Description**: Toggles client's active/inactive status

#### 7. Get Client Statistics

- **URL**: `GET /api/clients/stats`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Response**: Total, active, inactive, recent clients and nationality breakdown

## User Roles

- **admin**: Can manage clients and all system operations
- **user**: Standard user with basic access (no client management)
- **Note**: Client role removed - clients are now managed as data records by admins

## Validation Rules

### User Registration

- **Name**: 2-100 characters, required
- **Email**: Valid email format, unique, required
- **Password**: Minimum 6 characters, required
- **Role**: Must be either "admin" or "user", required
- **Confirm Password**: Must match password, required
- **Phone Number**: 10-15 digits, optional

### Client Creation

- **Name**: 2-100 characters, required
- **Family Name**: 2-100 characters, required
- **Email**: Valid email format, unique, required
- **Passport Number**: 6-20 alphanumeric characters, unique, required
- **Nationality**: 2-50 characters, required
- **Date of Birth**: Valid date (YYYY-MM-DD), must be 18+ years old, required
- **Age**: Calculated automatically from date of birth
- **Phone Number**: 10-15 digits, required
- **Current Address**: 10-500 characters, required
- **Address in Thailand**: Up to 500 characters, optional
- **WhatsApp**: 10-15 digits, optional
- **LINE**: 3-50 characters, optional

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
- `npm run migrate-schema`: Run database schema migration
- `npm run create-admin`: Create default admin user
- `npm run sync-db`: Sync database (legacy)

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
