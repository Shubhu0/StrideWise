import { Router, Request, Response } from 'express'
import { User } from '../models/User'

const router = Router()

// Get user profile
router.get('/profile/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).populate('currentTrainingPlan')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.put('/profile/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user stats
router.get('/stats/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('stats')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user.stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router