# Task Manager - MERN Stack Application

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, CRUD operations, and modern UI.

## Features

- ✅ User authentication (register/login/logout) with JWT
- ✅ Create, read, update, and delete tasks
- ✅ Task categories, priorities, and due dates
- ✅ Protected routes for authenticated users
- ✅ Redux Toolkit for state management
- ✅ Responsive modern UI
- ✅ Error handling and validation
- ✅ API testing with Jest

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcrypt for password hashing
- Jest for testing

### Frontend
- React 18
- Redux Toolkit
- React Router
- Axios for API calls
- Tailwind CSS for styling

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks for current user (protected)
- `POST /api/tasks` - Create a new task (protected)
- `PUT /api/tasks/:id` - Update a task (protected)
- `DELETE /api/tasks/:id` - Delete a task (protected)

## Database Models

### User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

### Task Schema
```javascript
{
  title: String (required),
  description: String,
  category: String,
  priority: String (low, medium, high),
  dueDate: Date,
  completed: Boolean (default: false),
  user: ObjectId (ref: 'User', required),
  createdAt: Date
}
```

## Testing

Run backend tests:
```bash
cd server
npm test
```

## Deployment

### Live Application
- **Frontend**: https://task-manager-mern-sable.vercel.app
- **Backend**: https://task-manager-backend-z0fh.onrender.com
- **Database**: MongoDB Atlas (cloud-hosted)

### Deployment Platforms
- **Frontend**: Vercel (automatic deployment from GitHub)
- **Backend**: Render (automatic deployment from GitHub)
- **Database**: MongoDB Atlas (cloud database)

### Environment Variables (Production)
The application uses the following environment variables in production:

**Backend (Render)**:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong JWT secret key
- `NODE_ENV`: production
- `PORT`: 10000 (Render default)

**Frontend (Vercel)**:
- `REACT_APP_API_URL`: Backend API URL

### Security Features
- ✅ HTTPS enabled on all services
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Environment variables for sensitive data
- ✅ CORS properly configured
- ✅ Input validation and sanitization

## Project Structure

```
/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── features/      # Redux slices
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── tests/            # Test files
│   └── server.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
# Force redeploy
