import { Router } from 'express'

const router = Router()

// Mock training plans data
const mockTrainingPlans = [
  {
    id: 1,
    name: '5K Beginner',
    duration: '8 weeks',
    level: 'Beginner',
    description: 'Perfect for new runners aiming to complete their first 5K',
    workoutsPerWeek: 3,
    targetDistance: 5,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 'Monday', type: 'Easy Run', duration: 20, distance: 2 },
          { day: 'Wednesday', type: 'Walk/Run', duration: 25, distance: 2.5 },
          { day: 'Friday', type: 'Easy Run', duration: 20, distance: 2 }
        ]
      }
      // More weeks...
    ]
  },
  {
    id: 2,
    name: '10K Intermediate',
    duration: '12 weeks',
    level: 'Intermediate',
    description: 'Build endurance and speed for a strong 10K finish',
    workoutsPerWeek: 4,
    targetDistance: 10,
    weeks: []
  },
  {
    id: 3,
    name: 'Half Marathon',
    duration: '16 weeks',
    level: 'Advanced',
    description: 'Comprehensive training for 21.1K distance',
    workoutsPerWeek: 5,
    targetDistance: 21.1,
    weeks: []
  }
]

// Get all training plans
router.get('/', (req, res) => {
  const { level, duration } = req.query
  let filteredPlans = mockTrainingPlans
  
  if (level) {
    filteredPlans = filteredPlans.filter(plan => 
      plan.level.toLowerCase() === (level as string).toLowerCase()
    )
  }
  
  res.json({
    trainingPlans: filteredPlans,
    total: filteredPlans.length
  })
})

// Get training plan by ID
router.get('/:id', (req, res) => {
  const plan = mockTrainingPlans.find(p => p.id === parseInt(req.params.id))
  if (!plan) {
    return res.status(404).json({ error: 'Training plan not found' })
  }
  res.json(plan)
})

// Get current week for a training plan
router.get('/:id/current-week', (req, res) => {
  const planId = parseInt(req.params.id)
  const { weekNumber = 1 } = req.query
  
  const plan = mockTrainingPlans.find(p => p.id === planId)
  if (!plan) {
    return res.status(404).json({ error: 'Training plan not found' })
  }
  
  // Mock current week data
  const currentWeek = {
    weekNumber: parseInt(weekNumber as string),
    planName: plan.name,
    workouts: [
      { 
        day: 'Monday', 
        type: 'Easy Run', 
        duration: 30, 
        distance: 5,
        completed: false,
        scheduled: true
      },
      { 
        day: 'Wednesday', 
        type: 'Interval Training', 
        duration: 45, 
        distance: 6,
        completed: true,
        scheduled: true
      },
      { 
        day: 'Friday', 
        type: 'Long Run', 
        duration: 60, 
        distance: 8,
        completed: false,
        scheduled: true
      }
    ],
    progress: {
      completedWorkouts: 1,
      totalWorkouts: 3,
      weeklyDistance: 6,
      targetDistance: 19
    }
  }
  
  res.json(currentWeek)
})

// Enroll in a training plan
router.post('/:id/enroll', (req, res) => {
  const planId = req.params.id
  const { userId, startDate } = req.body
  
  // Mock enrollment
  res.status(201).json({
    message: 'Successfully enrolled in training plan',
    enrollment: {
      id: Date.now(),
      planId,
      userId,
      startDate,
      currentWeek: 1,
      status: 'active'
    }
  })
})

export default router