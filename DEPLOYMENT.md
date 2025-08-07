# AlwayCare Deployment Guide

## Overview
AlwayCare is a full-stack application with a React frontend and Node.js backend. To deploy to production, you need to deploy both parts separately.

## Frontend Deployment (Netlify)

### 1. Build the React App
```bash
cd client
npm run build
```

### 2. Deploy to Netlify
- Connect your GitHub repository to Netlify
- Set build command: `cd client && npm run build`
- Set publish directory: `client/build`
- Set environment variable: `REACT_APP_API_BASE_URL=https://your-backend-url.com`

## Backend Deployment Options

### Option 1: Render (Recommended - Free)
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `node server/index.js`
6. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (or let Render assign one)
   - `JWT_SECRET=your-secret-key`

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Set environment variables as above

### Option 3: Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new app
4. Deploy using Git

## Environment Variables

### Frontend (.env.production)
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
```

### Backend
```
NODE_ENV=production
JWT_SECRET=your-secret-key
PORT=10000
```

## Database Setup

The application uses SQLite for development. For production, consider:

1. **SQLite (File-based)** - Works on Render/Railway
2. **PostgreSQL** - Better for production
3. **MongoDB** - Alternative NoSQL option

## CORS Configuration

Update the backend CORS settings in `server/index.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.netlify.app']
    : 'http://localhost:3000',
  credentials: true
}));
```

## File Uploads

For production, consider using:
- **AWS S3** for file storage
- **Cloudinary** for image processing
- **Local storage** (current setup works on Render)

## Troubleshooting

### Common Issues:
1. **CORS errors** - Check CORS configuration
2. **API not found** - Verify API_BASE_URL is correct
3. **Database errors** - Ensure database file is writable
4. **File upload errors** - Check upload directory permissions

### Debug Steps:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test backend health endpoint
4. Check environment variables

## Quick Deploy Commands

### Frontend (Netlify)
```bash
cd client
npm run build
# Upload build folder to Netlify
```

### Backend (Render)
```bash
# Connect GitHub repo to Render
# Set environment variables
# Deploy automatically
```

## Support
For deployment issues, check:
- Render/Railway logs
- Netlify build logs
- Browser console errors
- Network tab for API calls
