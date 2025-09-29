# StrideWise Build & Deployment Guide

## 🏗️ Build Process

The StrideWise application has been successfully built and is ready for both development and production deployment.

### Build Status
✅ **Frontend Built Successfully** 
- TypeScript compilation: Complete
- Vite production bundle: Generated
- Bundle size: 849.51 kB (247.31 kB gzipped)
- Location: `frontend/dist/`

✅ **Backend Built Successfully**
- TypeScript compilation: Complete  
- Production JavaScript: Generated
- Location: `backend/dist/`

## 🚀 Deployment Options

### Option 1: Production Mode (Recommended)
Run the complete application in production mode:

```bash
# Make sure you're in the root directory
./start-production.sh
```

This will:
- Start MongoDB if not running
- Build applications if needed
- Start backend on http://localhost:3000
- Start frontend on http://localhost:3001
- Handle graceful shutdown with Ctrl+C

### Option 2: Manual Production Deployment

**Start Backend:**
```bash
cd backend
NODE_ENV=production node dist/server.js
```

**Start Frontend:**
```bash
cd frontend
npm run start
```

### Option 3: Development Mode
Continue development with hot-reload:

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash  
cd backend
npm run dev
```

## 📦 Built Assets

### Frontend (`frontend/dist/`)
- `index.html` - Main application entry point
- `assets/` - Bundled CSS and JavaScript files
- Static assets (icons, images)

### Backend (`backend/dist/`)
- `server.js` - Main server entry point
- `models/` - Database models
- `routes/` - API route handlers  
- `services/` - Business logic services

## 🔧 Configuration

### Environment Variables
Ensure these are set in `backend/.env`:
```
STRAVA_CLIENT_ID=178614
STRAVA_CLIENT_SECRET=aa0fd9cd39a4d3f0654e1170700bdb0e2d8bbf52
MONGODB_URI=mongodb://localhost:27017/stridewise
NODE_ENV=production
```

### Prerequisites
- Node.js (v18+)
- MongoDB Community Edition
- npm or yarn package manager

## 🏃‍♂️ Application Features

The built application includes:
- ✅ Dynamic user ID generation
- ✅ Real Strava OAuth integration  
- ✅ AI-powered training plan generation
- ✅ Real-time activity sync
- ✅ Comprehensive dashboard
- ✅ Progress tracking
- ✅ SSL certificate handling for Strava API

## 📱 Access URLs

**Development:**
- Frontend: http://localhost:5175
- Backend API: http://localhost:3000

**Production:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## 🔍 Health Checks

Test the application:
```bash
# Backend health
curl http://localhost:3000/health

# Frontend (should return HTML)
curl http://localhost:3001
```

## 📈 Performance Notes

The frontend bundle includes:
- React 18 with TypeScript
- Material-UI component library
- Recharts for data visualization
- Strava integration components

Bundle optimization suggestions:
- Code splitting for large chunks (>500KB warning)
- Lazy loading for routes
- Dynamic imports for heavy components

## 🎯 Next Steps

1. **Test the Application**: Visit http://localhost:3001 and test the Strava connection
2. **Monitor Performance**: Check application performance and resource usage
3. **Deploy to Production**: Consider cloud deployment (AWS, Azure, Vercel)
4. **SSL Certificate**: Set up HTTPS for production deployment
5. **Database**: Configure production MongoDB instance

Your StrideWise application is now built and ready to run! 🏃‍♂️✨