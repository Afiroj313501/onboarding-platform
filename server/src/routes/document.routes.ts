import { Router } from 'express'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// GET /api/documents - get documents for the logged-in user's company
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.companyId) {
      return res.status(404).json({ message: 'No company associated with this user' })
    }

    const documents = await prisma.document.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ documents })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router