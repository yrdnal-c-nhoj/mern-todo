# Deployment Guide

## Backend (Render)

1. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new "Web Service"
   - Select the `backend` folder as the root directory
   - Use the `render.yaml` configuration file
   - Set environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `NODE_ENV`: production
     - `PORT`: 10000 (Render's default)

2. **Environment Variables on Render:**
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   NODE_ENV=production
   PORT=10000
   ```

## Frontend (Vercel)

1. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the project
   - Set the root directory to `frontend`
   - Configure environment variables:
     - `VITE_API_URL`: https://your-render-app.onrender.com

2. **Environment Variables on Vercel:**
   ```
   VITE_API_URL=https://your-render-app.onrender.com
   ```

## Post-Deployment Steps

1. **Update CORS Origins:**
   - In your backend code, update the CORS origins to include your Vercel URL
   - Example: `['https://your-app.vercel.app']`

2. **Test the Application:**
   - Visit your Vercel URL
   - Test adding/deleting todos
   - Check browser console for any CORS errors

## Important Notes

- The backend will be deployed at: `https://your-app-name.onrender.com`
- The frontend will be deployed at: `https://your-app-name.vercel.app`
- Make sure to update the CORS origins in the backend after getting your Vercel URL
- The MongoDB URI should be the same in both development and production
