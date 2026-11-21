
# Alzikrayat - MERN Edition

A full-stack photo-sharing application built with the MERN stack.

## Technologies

- MongoDB Atlas
- Express.js
- React.js
- Node.js
- Vite
- Mongoose
- Multer
- bcryptjs
- jsonwebtoken
- React Router

## Features

- User Registration and Login
- JWT Authentication
- Protected API Routes
- Token-based Authorization
- Photo Gallery
- Upload Photos
- Photo Details
- Add Comments
- Delete Own Photos
- Grid and List Views

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Braa-799/Alzikrayat2.git
cd Alzikrayat2
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
node server.js
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/photos | Get Photos |
| POST | /api/photos/upload | Upload Photo |
| DELETE | /api/photos/:id | Delete Photo |
| GET | /api/photos/:id/comments | Get Comments |
| POST | /api/photos/:id/comments | Add Comment |

## JWT Authentication

- Passwords are hashed using bcryptjs.
- JWT tokens are generated after successful registration and login.
- Tokens expire after 7 days.
- Protected routes require a valid Bearer token.
- The frontend stores the token in localStorage.
- Logout removes the stored token.

## Protected API Endpoints

| Method | Endpoint | Authentication |
|---|---|---|
| POST | /api/photos/upload | Required |
| DELETE | /api/photos/:id | Required |
| POST | /api/photos/:id/comments | Required |

## Security Testing

- Requests without a token return 401 Unauthorized.
- Requests with an invalid token return 401 Unauthorized.
- Photo deletion requires authentication and ownership.

## Academic Project

Advanced Web Technologies

Alzikrayat - MERN Edition
