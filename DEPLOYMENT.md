# Deployment Guide

This guide will help you deploy your Task Manager MERN application to the cloud.

## Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier is fine)
   - Get your connection string

2. **GitHub Account**
   - Push your code to GitHub

3. **Vercel Account** (for frontend)
   - Sign up at [Vercel](https://vercel.com)

4. **Render Account** (for backend)
   - Sign up at [Render](https://render.com)

## Step 1: Set up MongoDB Atlas

1. Create a new MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string
4. Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)

## Step 2: Deploy Backend to Render

1. **Connect your GitHub repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**
   - **Name**: `task-manager-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: a171903933c6b0e1e403976d4c7fd6c0cd6b59e3dbaaa82a2b2e3d4e25afdb8cf5636ae1c515e2e23a52515a354581a101d54825848216e8c9a70de1001acb35
   - `NODE_ENV`: `production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://task-manager-backend-z0fh.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. **Connect your GitHub repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure the project**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Set Environment Variables**
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://task-manager-backend-z0fh.onrender.comi`)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update README

Update your README.md with the deployment links:

```markdown
## Deployment

### Frontend (Vercel)
- Deployed at: https://task-manager-mern-sable.vercel.app
- Automatic deployment from GitHub main branch

### Backend (Render)
- Deployed at: https://task-manager-backend-z0fh.onrender.com/
- Automatic deployment from GitHub main branch

### Database (MongoDB Atlas)
- Cloud-hosted MongoDB database
- Secure connection with environment variables
```

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Register a new account
3. Create some tasks
4. Test all CRUD operations
5. Verify authentication works

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure your backend URL is correct in the frontend environment variables
   - Check that CORS is properly configured in the backend

2. **Database Connection Issues**
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check that all dependencies are in package.json
   - Verify build commands are correct
   - Check for any TypeScript errors

4. **Environment Variables**
   - Make sure all required environment variables are set
   - Check that variable names match exactly
   - Restart services after changing environment variables

### Useful Commands

```bash
# Test backend locally
cd server
npm install
npm run dev

# Test frontend locally
cd client
npm install
npm start

# Run backend tests
cd server
npm test

# Build frontend for production
cd client
npm run build
```

## Security Considerations

1. **JWT Secret**: Use a strong, random string
2. **MongoDB Atlas**: Use network access controls
3. **Environment Variables**: Never commit .env files
4. **HTTPS**: Both Vercel and Render provide HTTPS by default

## Monitoring

- **Vercel**: Check deployment logs and analytics
- **Render**: Monitor service logs and performance
- **MongoDB Atlas**: Monitor database performance and usage

## Cost Optimization

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier includes 750 hours/month
- **MongoDB Atlas**: Free tier includes 512MB storage

All services offer free tiers that are sufficient for this project.
