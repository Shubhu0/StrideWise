import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

// Debug environment variables
console.log('Environment loaded:')
console.log('STRAVA_CLIENT_ID:', process.env.STRAVA_CLIENT_ID)
console.log('STRAVA_CLIENT_SECRET:', process.env.STRAVA_CLIENT_SECRET ? 'SET' : 'NOT SET')

// Import routes AFTER dotenv config
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import workoutRoutes from './routes/workouts'
import trainingPlanRoutes from './routes/trainingPlans'
import stravaRoutes from './routes/strava'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175'
  ],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'StrideWise API'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/training-plans', trainingPlanRoutes)
app.use('/api/strava', stravaRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

// Database connection (optional for development)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.warn('MongoDB connection failed:', error.message))
} else {
  console.log('Running in mock mode - no database connection')
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Frontend should connect to: http://localhost:${PORT}`)
})

export default app