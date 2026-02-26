# Deployment Guide

## Backend (Node.js Hosting)

1. **Deploy to Node.js hosting service:**
   - Options: Heroku, Railway, DigitalOcean App Platform, etc.
   - Connect your GitHub repository
   - Create a new "Web Service"
   - Select the `backend` folder as the root directory
   - Set environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `NODE_ENV`: production
     - `PORT`: (varies by host, often 8080 or 3000)

2. **Environment Variables:**

```bash
MONGO_URI=mongodb+srv://your-connection-string
NODE_ENV=production
PORT=8080
```

## Frontend (Alternative Static Hosting)

1. **Deploy to static hosting service:**
   - Options: Netlify, GitHub Pages, Cloudflare Pages, etc.
   - Connect your GitHub repository
   - Import the project
   - Set the root directory to `frontend`
   - Configure environment variables:
     - `VITE_API_URL`: https://your-backend-url.com

2. **Environment Variables:**
```bash
VITE_API_URL=https://your-backend-url.com
```

## Post-Deployment Steps

1. **Update CORS Origins:**
   - In your backend code, update the CORS origins to include your frontend URL
   - Example: `['https://your-app.netlify.app']`

2. **Test the Application:**
   - Visit your frontend URL
   - Test adding/deleting todos
   - Check browser console for any CORS errors

## Important Notes

- The backend will be deployed at: `https://your-app-name.hosting-platform.com`
- The frontend can be deployed at: `https://your-app-name.netlify.app` (or other static host)
- Make sure to update the CORS origins in the backend after getting your frontend URL
- The MongoDB URI should be the same in both development and production
