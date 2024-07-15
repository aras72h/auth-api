# User Authentication API

## Overview

This is a basic user authentication API built with Node.js, Express, and Sequelize. It allows users to register, log in, update their information, and delete their accounts.

## Features

- User registration
- User login
- Update user information (email and password)
- Delete user account
- JWT-based authentication

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
   DB_NAME=auth-app
   DB_USER=username
   DB_PASSWORD=password
   DB_HOST=localhost
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

### License

This project is licensed under the MIT License.