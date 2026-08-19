import { Router } from 'express'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Middleware: restrict to HR_ADMIN only
function requireHrAdmin(req: any, res: any, next: any) {
  if (req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'HR Admin access required' })
  }
  next()
}

// GET /api/employees - list all employees in the HR admin's company
router.get('/', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const hrUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!hrUser?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const employees = await prisma.employee.findMany({
      where: { companyId: hrUser.companyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ employees })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/employees/unassigned - users in the system with no Employee record yet
router.get('/unassigned', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        employee: null,
        role: 'EMPLOYEE',
      },
      select: { id: true, name: true, email: true, role: true, companyId: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/employees - create an Employee record for a given user
router.post('/', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const { userId, position, department } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!hrUser?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const existing = await prisma.employee.findUnique({ where: { userId } })
    if (existing) {
      return res.status(400).json({ message: 'This user is already an employee' })
    }

    // Ensure the user is linked to the same company
    await prisma.user.update({
      where: { id: userId },
      data: { companyId: hrUser.companyId },
    })

    const employee = await prisma.employee.create({
      data: {
        userId,
        companyId: hrUser.companyId,
        position: position || null,
        department: department || null,
      },
      include: { user: true },
    })

    res.status(201).json({ message: 'Employee created', employee })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router