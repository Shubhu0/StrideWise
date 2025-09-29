import { Router, Request, Response } from 'express'

const router = Router()

// Mock routes for development - replace with proper auth later
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body
    
    // Simple mock response for development
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: '1',
        firstName,
        lastName,
        email,
        fitnessLevel: 'beginner'
      },
      token: 'mock-jwt-token'
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    // Simple mock response for development
    res.json({
      message: 'Login successful',
      user: {
        id: '1',
        firstName: 'Alex',
        lastName: 'Runner',
        email,
        fitnessLevel: 'intermediate'
      },
      token: 'mock-jwt-token'
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/verify', async (req: Request, res: Response) => {
  try {
    res.json({
      valid: true,
      user: {
        id: '1',
        firstName: 'Alex',
        lastName: 'Runner',
        email: 'alex@example.com',
        fitnessLevel: 'intermediate'
      }
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router