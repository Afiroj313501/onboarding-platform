import { Router } from 'express'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// POST /api/feedback - submit feedback
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId
    const { content, rating } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback content is required' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        content,
        rating: rating ?? null,
        userId,
      },
    })

    res.status(201).json({ message: 'Feedback submitted', feedback })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/feedback - get the logged-in user's own feedback history
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId

    const feedbacks = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ feedbacks })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router