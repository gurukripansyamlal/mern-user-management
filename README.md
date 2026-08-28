# MERN User Management System

A secure, production-ready Full-Stack User Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js). The system features token-based authentication with JSON Web Tokens (JWT), password hashing with bcryptJS, role-based access control (RBAC), protected routing, and user profile management.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication & Authorization Flow](#authentication--authorization-flow)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Verification Checklist](#verification-checklist)

---

## Overview

The MERN User Management System enables users to:
- **Register** an account with email validation and secure password hashing.
- **Log in** with credentials and receive a secure JSON Web Token (JWT).
- **Persist sessions** across page reloads using browser local storage with token verification.
- **View and update profile** details (name, email) with conflict prevention and role escalation protection.
- **Delete their own account** (self-deletion).
- **Admin Dashboard**: Administrators can view a directory of all registered users and delete user accounts.

---

## Tech Stack

### Backend
- **Node.js** (v18+) & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (ODM)
- **bcryptJS** (Password hashing)
- **JSON Web Tokens (JWT)** (Stateless session tokens)
- **Cors & Dotenv** (CORS management and environment configuration)
- **Vitest, Supertest & MongoMemoryServer** (Automated backend testing)

### Frontend
- **React.js 18** (UI component architecture)
- **React Router 6** (Client-side routing and protected navigation)
- **Axios** (Centralized API client with JWT interceptors)
- **Lucide React** (Modern, clean icon set)
- **Vite** (Next-generation frontend tooling and bundler)
- **Vitest & React Testing Library** (Frontend unit/component testing)

---

## Project Structure

```
mern-user-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # Signup & Login business logic
│   │   └── userController.js     # Profile retrieval/update, delete, & user listing
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer validation & admin role authorization
│   │   └── errorMiddleware.js    # 404 handler & centralized error processing
│   ├── models/
│   │   └── User.js               # Mongoose schema with bcrypt pre-save & toJSON transforms
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── tests/
│   │   ├── setup.js              # Vitest test setup with mongodb-memory-server
│   │   ├── auth.test.js          # Authentication endpoint tests
│   │   ├── profile.test.js       # User profile & validation tests
│   │   └── delete.test.js        # Deletion authorization & user listing tests
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies and scripts
│   ├── server.js                 # Express server configuration and export
│   └── vitest.config.js          # Backend Vitest configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Status and notification alerts
│   │   │   ├── ConfirmModal.jsx  # Confirmation dialog for destructive actions
│   │   │   ├── LoadingSpinner.jsx# Reusable loading spinner
│   │   │   ├── Navbar.jsx        # Navigation bar with user status and logout
│   │   │   └── ProtectedRoute.jsx# Auth guard redirecting unauthenticated users
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Context managing user session, state & methods
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # User overview & Admin management table
│   │   │   ├── Login.jsx         # Sign-in form with validation
│   │   │   ├── Profile.jsx       # Profile settings & account deletion
│   │   │   └── Signup.jsx        # Registration form with role options
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with JWT request interceptor
│   │   │   ├── authService.js    # Auth API communication
│   │   │   └── userService.js    # User API communication
│   │   ├── __tests__/
│   │   │   └── Auth.test.jsx     # Frontend authentication unit tests
│   │   ├── App.jsx               # Route definitions & providers
│   │   ├── index.css             # Modern design system and styles
│   │   ├── main.jsx              # React DOM entry point
│   │   └── setupTests.js         # Testing library setup
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # HTML document template
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite build configuration and dev proxy
├── .gitignore                    # Root gitignore excluding .env, node_modules, dist
├── package.json                  # Root runner script
└── README.md                     # Documentation
```

---

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (version 18.x or 20.x recommended)
- **npm** (version 9.x or higher)
- **MongoDB** (Local instance running on `localhost:27017` or a MongoDB Atlas connection string)

---

## Installation & Setup

### 1. Clone or Open the Repository
```bash
cd /path/to/mern-user-management
```

### 2. Install Dependencies
You can install dependencies for both backend and frontend from the root:
```bash
npm run install:all
```
Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend/` directory by copying `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Set the values according to your environment:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mern_user_mgmt
JWT_SECRET=super_secret_jwt_key_mern_user_management_2026_secure
JWT_EXPIRE=30d
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory by copying `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=/api
```
*(When developing locally with Vite, requests to `/api` are automatically proxied to `http://localhost:5000`)*.

---

## MongoDB Setup

### Option A: Local MongoDB
1. Start MongoDB locally (e.g. `brew services start mongodb-community` on macOS, `sudo systemctl start mongod` on Linux, or via Docker).
2. The default `MONGO_URI` in `.env` (`mongodb://127.0.0.1:27017/mern_user_mgmt`) will connect automatically.

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your IP address (or `0.0.0.0/0`).
3. Copy the connection URI and update `MONGO_URI` in `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mern_user_mgmt?retryWrites=true&w=majority
   ```

---

## Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
# Server will run at http://localhost:5000
```

### Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm run dev
# Vite client will run at http://localhost:3000
```

---

## API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Health Check
- **`GET /health`**
  - **Access**: Public
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "environment": "development",
      "uptime": 12.34,
      "timestamp": "2026-08-29T02:00:00.000Z"
    }
    ```

---

### 2. Authentication Endpoints

#### `POST /auth/signup`
- **Access**: Public
- **Description**: Register a new account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "user"
  }
  ```
- **Validation**:
  - `name`: Required, min 2 characters.
  - `email`: Required, valid email format, unique in database.
  - `password`: Required, min 6 characters.
  - `role`: Optional (`user` or `admin`, defaults to `user`).
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "66ce...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-08-29T02:00:00.000Z",
      "updatedAt": "2026-08-29T02:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure or missing fields.
  - `400 Bad Request`: `"User already exists with this email address"`.

#### `POST /auth/login`
- **Access**: Public
- **Description**: Authenticate credentials and receive a JWT.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "66ce...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-08-29T02:00:00.000Z",
      "updatedAt": "2026-08-29T02:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: `"Invalid email or password"`.

---

### 3. User Endpoints (Protected)

*All protected endpoints require the HTTP header:*
`Authorization: Bearer <token>`

#### `GET /users/profile`
- **Access**: Private (Authenticated User)
- **Description**: Fetch the authenticated user's profile.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "66ce...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-08-29T02:00:00.000Z",
      "updatedAt": "2026-08-29T02:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing, invalid, or expired token.

#### `PUT /users/profile`
- **Access**: Private (Authenticated User)
- **Description**: Update profile name and email address.
- **Request Body**:
  ```json
  {
    "name": "Jane Updated",
    "email": "jane.updated@example.com"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      "_id": "66ce...",
      "name": "Jane Updated",
      "email": "jane.updated@example.com",
      "role": "user",
      "createdAt": "2026-08-29T02:00:00.000Z",
      "updatedAt": "2026-08-29T02:05:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid name or email format.
  - `409 Conflict`: `"Email is already in use by another account"`.

#### `DELETE /users/:id`
- **Access**: Private (Self-Deletion OR Admin)
- **Description**: Delete a user account. Permitted if the caller is an administrator OR the authenticated user ID matches `:id`.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "deletedUserId": "66ce..."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid ObjectId format.
  - `403 Forbidden`: Caller is not an admin and not deleting their own account.
  - `404 Not Found`: User with `:id` does not exist.

#### `GET /users`
- **Access**: Private (Admin Only)
- **Description**: Retrieve a list of all registered users in descending creation order.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "users": [
      {
        "_id": "66ce...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user",
        "createdAt": "2026-08-29T02:00:00.000Z",
        "updatedAt": "2026-08-29T02:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Non-admin access attempt.

---

## Authentication & Authorization Flow

```
1. Client -> POST /api/auth/signup or /api/auth/login
2. Server validates inputs, checks credentials / hashes password with bcryptJS
3. Server returns JWT signed with JWT_SECRET and sanitized user object
4. Frontend stores JWT in localStorage and context state
5. Axios Request Interceptor automatically injects "Authorization: Bearer <token>"
6. ProtectedRoute checks context auth state on navigation; redirects unauthenticated users to /login
7. On page reload, AuthContext validates token with GET /api/users/profile
8. On logout or account deletion, token is cleared from localStorage and state
```

---

## Testing

The project includes automated test suites for both backend and frontend.

### Running Backend Tests
The backend test suite uses `vitest`, `supertest`, and `mongodb-memory-server` (an isolated in-memory MongoDB database that requires no external database setup).

```bash
cd backend
npm test
```

**Tested Backend Scenarios (23 Tests):**
- Signup with valid credentials (201 Created + JWT + sanitized user)
- Duplicate email signup rejection (400 Bad Request)
- Missing required fields validation
- Invalid email format rejection
- Password length validation (< 6 characters)
- Password exclusion from all API responses and database hashing verification
- Login with valid credentials (200 OK + JWT)
- Login with invalid password (401 Unauthorized)
- Login with non-existent email (401 Unauthorized)
- Protected profile GET without token (401 Unauthorized)
- Protected profile GET with invalid token (401 Unauthorized)
- Protected profile GET with valid token (200 OK)
- Profile update of name and email (200 OK)
- Profile update email conflict rejection (409 Conflict)
- Privilege escalation prevention (users cannot change their role)
- Self-account deletion (200 OK)
- Admin deletion of any user account (200 OK)
- Non-admin deletion of another user account (403 Forbidden)
- Deletion of non-existent user (404 Not Found)
- Deletion with invalid ObjectId (400 Bad Request)
- Admin retrieval of all users (200 OK)
- Non-admin blocked from listing all users (403 Forbidden)

### Running Frontend Tests
The frontend tests use `vitest` and `@testing-library/react` to verify authentication forms and user interaction.

```bash
cd frontend
npm test
```

**Tested Frontend Scenarios (5 Tests):**
- Login form rendering (email, password, buttons)
- Login client-side validation on empty submissions
- Login API invocation with valid user input
- Signup form rendering (full name, email, password, role dropdown)
- Signup client-side password length validation

---

## Security Considerations

1. **Password Hashing**: Passwords are never stored as plaintext. Passwords are salted and hashed using `bcryptjs` with 10 salt rounds before being written to MongoDB.
2. **Never Return Passwords**: The User model implements schema-level `toJSON` and `toObject` transforms and explicit query projections (`select('-password')`) to ensure passwords and internal version keys (`__v`) are never returned in responses.
3. **JWT Bearer Authentication**: Stateless, signed tokens using strong secrets (`JWT_SECRET`) and sensible expiration (`JWT_EXPIRE`).
4. **Role Escalation Protection**: The profile update endpoint explicitly filters out the `role` field so users cannot escalate their privileges.
5. **Granular Authorization**: Deletion endpoints enforce strict ownership checks (`req.user.role === 'admin' || req.user._id.toString() === req.params.id`).
6. **Input Sanitization**: Email addresses are trimmed and normalized to lowercase; format is validated using regex patterns.
7. **Environment Safety**: Secrets (`JWT_SECRET`, `MONGO_URI`) are strictly loaded via `.env` and excluded from source control via `.gitignore`.

---

## Verification Checklist

| # | Requirement | Status | Verification Note |
|---|---|---|---|
| 1 | Dependencies Installed | Completed | `backend/` and `frontend/` packages installed |
| 2 | Backend Startup | Verified | Express app with route mounting & DB handler |
| 3 | Frontend Startup | Verified | Vite dev server / production build verified |
| 4 | MongoDB Connection | Verified | `backend/config/db.js` with fallback & error handling |
| 5 | Signup Endpoint | Verified | `POST /api/auth/signup` passes automated test |
| 6 | Duplicate Signup Rejection | Verified | 400 Bad Request returned with descriptive error |
| 7 | Login Valid Credentials | Verified | `POST /api/auth/login` returns JWT & user object |
| 8 | Login Invalid Credentials | Verified | 401 Unauthorized returned |
| 9 | Protected Profile (No Token) | Verified | 401 Unauthorized returned |
| 10 | Protected Profile (Valid Token) | Verified | 200 OK with sanitized profile returned |
| 11 | Profile Update | Verified | `PUT /api/users/profile` updates name/email & prevents conflicts |
| 12 | Unauthorized User Deletion | Verified | 403 Forbidden when standard user attempts deletion of other users |
| 13 | Self-Deletion | Verified | 200 OK when user deletes own account |
| 14 | Admin Deletion | Verified | 200 OK when admin deletes target user |
| 15 | Protected Route Redirect | Verified | Frontend `ProtectedRoute` redirects to `/login` |
| 16 | Persistent Login After Refresh | Verified | `AuthContext` restores session and validates via profile API |
| 17 | Logout Functionality | Verified | Clears localStorage token & user state |
| 18 | No Password Exposure | Verified | Password excluded from model toJSON and all controller outputs |
| 19 | `.env` Git Ignored | Verified | Checked via `git check-ignore` |
| 20 | Clear Documentation | Completed | Full API reference, setup guide, and architectural notes |
