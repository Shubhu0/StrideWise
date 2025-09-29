import { Router } from 'express'

const router = Router()

// Mock workout data
const mockWorkouts = [
  {
    id: 1,
    type: 'Easy Run',
    duration: 30,
    distance: 5,
    intensity: 'Low',
    description: 'Comfortable pace run to build aerobic base',
    calories: 300
  },
  {
    id: 2,
    type: 'Interval Training',
    duration: 45,
    distance: 6,
    intensity: 'High',
    description: '5 x 3min at 5K pace with 2min recovery',
    calories: 450
  },
  {
    id: 3,
    type: 'Long Run',
    duration: 60,
    distance: 10,
    intensity: 'Medium',
    description: 'Build endurance with steady long run',
    calories: 600
  }
]

// Get all workouts
router.get('/', (req, res) => {
  res.json({
    workouts: mockWorkouts,
    total: mockWorkouts.length
  })
})

// Get workout by ID
router.get('/:id', (req, res) => {
  const workout = mockWorkouts.find(w => w.id === parseInt(req.params.id))
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' })
  }
  res.json(workout)
})

// Create new workout session
router.post('/sessions', (req, res) => {
  const { workoutId, userId, startTime } = req.body
  
  // Mock workout session creation
  const session = {
    id: Date.now(),
    workoutId,
    userId,
    startTime,
    status: 'active',
    metrics: {
      currentDistance: 0,
      currentTime: 0,
      avgPace: 0,
      heartRate: 0
    }
  }
  
  res.status(201).json({
    message: 'Workout session started',
    session
  })
})

// Update workout session
router.put('/sessions/:id', (req, res) => {
  const sessionId = req.params.id
  const updates = req.body
  
  // Mock session update
  res.json({
    message: 'Workout session updated',
    sessionId,
    updates
  })
})

// Complete workout session
router.post('/sessions/:id/complete', (req, res) => {
  const sessionId = req.params.id
  const { finalMetrics } = req.body
  
  // Mock session completion
  res.json({
    message: 'Workout completed successfully!',
    sessionId,
    finalMetrics,
    achievements: ['Personal Best!', 'Consistency Streak: 5 days']
  })
})

export default router