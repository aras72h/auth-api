# User Authentication API

## Overview

This is a basic user authentication API built with Node.js, Express, and Sequelize. It allows users to register, log in, update their information, delete their accounts, and manage password recovery.

## Features

- User registration
- User login
- Update user information (email and password)
- Delete user account
- JWT-based authentication
- Forgot password functionality
- Reset password functionality

## Technologies Used

- Node.js
- Express
- Sequelize (with PostgreSQL)
- bcryptjs for password hashing
- jsonwebtoken for authentication

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- `npm` or `yarn`

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```plaintext
   PORT=5000
   JWT_SECRET=your_jwt_secret
   PROD_DOMAIN=https://www.example.com

   DB_NAME=auth-app
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_smtp_password
   EMAIL_FROM=no-reply@gmail.com
   ```

4. Run database migrations to set up the tables (if applicable).

### Running the Server

To start the server, run:

```bash
npm start
```

The server will run on `http://localhost:5000`.

### API Endpoints

- **POST** `/api/auth/register`: Register a new user
- **POST** `/api/auth/login`: Log in a user
- **PUT** `/api/users`: Update user information (requires token)
- **DELETE** `/api/users`: Delete a user account (requires token)
- **POST** `/api/auth/forgot-password`: Request a password reset
- **POST** `/api/auth/reset-password`: Reset a user's password
- **GET** `/api/auth/reset-password`: Verify reset token

### Example Usage

#### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "password123"}'
```

#### Log in a User

```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "password123"}'
```

This will return a JWT token that you must include in the Authorization header for protected routes.

#### Update User Information

```bash
curl -X PUT http://localhost:5000/api/users \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"email": "newemail@example.com", "password": "newpassword123"}'
```

#### Delete User Account

```bash
curl -X DELETE http://localhost:5000/api/users \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Request Password Reset

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com"}'
```

#### Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
-H "Content-Type: application/json" \
-d '{"token": "YOUR_RESET_TOKEN", "newPassword": "newpassword123"}'
```

#### Verify Reset Token

```bash
curl -X GET "http://localhost:5000/api/auth/reset-password?token=your_reset_token"
```

If the token is valid, you will receive a response like:

```json
{
    "message": "Valid token",
    "token": "your_reset_token"
}
```

If the token is invalid or expired, you will receive a response like:

```json
{
    "message": "Invalid or expired reset token."
}
```

### License

This project is licensed under the MIT License.