import { Router } from 'express'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// GET /api/tasks - get tasks for the logged-in employee
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { tasks: true }
    })

    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found for this user' })
    }

    res.json({ tasks: employee.tasks })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router