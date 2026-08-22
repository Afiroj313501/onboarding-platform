import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { askGemini } from '../services/gemini.service'

const router = Router()

const SYSTEM_CONTEXT = `You are a helpful onboarding assistant for a company's employee onboarding platform.
You help new employees with questions about company policies, their onboarding process, tasks, and general workplace questions.
Keep your answers concise, friendly, and professional. If you don't know something specific to this company (like exact policy details), say so honestly and suggest they check with HR or their manager.`

// POST /api/chat - ask the onboarding assistant a question
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const reply = await askGemini(message, SYSTEM_CONTEXT)

    res.json({ reply })
  } catch (error) {
    console.error('Gemini error:', error)
    res.status(500).json({ message: 'Failed to get a response. Please try again.' })
  }
})

export default router