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

router.post('/:employeeId/tasks', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const { employeeId } = req.params
    const { tasks } = req.body

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'At least one task is required' })
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    const created = await prisma.task.createMany({
      data: tasks.map((t: any) => ({
        title: t.title,
        description: t.description || null,
        priority: t.priority || 'medium',
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        employeeId,
      })),
    })

    res.status(201).json({ message: `${created.count} tasks created` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/employees/analytics - company-wide stats for HR Admin
router.get('/analytics', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const hrUser = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!hrUser?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const employees = await prisma.employee.findMany({
      where: { companyId: hrUser.companyId },
      include: { tasks: true },
    })

    const totalEmployees = employees.length
    const allTasks = employees.flatMap((e) => e.tasks)
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = allTasks.filter((t) => t.status === 'in_progress').length
    const pendingTasks = allTasks.filter((t) => t.status === 'pending').length
    const pendingExtensions = allTasks.filter((t) => t.extensionStatus === 'pending').length
    const pendingApprovals = allTasks.filter(
      (t) => t.progress === 100 && !t.approved && !t.needsRevision
    ).length

    const avgCompletionPct =
      totalEmployees > 0
        ? Math.round(
            employees.reduce((sum, e) => {
              const empAvg =
                e.tasks.length > 0
                  ? e.tasks.reduce((s, t) => s + t.progress, 0) / e.tasks.length
                  : 0
              return sum + empAvg
            }, 0) / totalEmployees
          )
        : 0

    // Department breakdown
    const deptMap: Record<string, { count: number; totalProgress: number; taskCount: number }> = {}
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned'
      if (!deptMap[dept]) deptMap[dept] = { count: 0, totalProgress: 0, taskCount: 0 }
      deptMap[dept].count += 1
      e.tasks.forEach((t) => {
        deptMap[dept].totalProgress += t.progress
        deptMap[dept].taskCount += 1
      })
    })

    const departmentBreakdown = Object.entries(deptMap).map(([name, d]) => ({
      department: name,
      employeeCount: d.count,
      avgProgress: d.taskCount > 0 ? Math.round(d.totalProgress / d.taskCount) : 0,
    }))

    const feedbackCount = await prisma.feedback.count({
      where: { user: { companyId: hrUser.companyId } },
    })

    const avgRatingResult = await prisma.feedback.aggregate({
      where: { user: { companyId: hrUser.companyId }, rating: { not: null } },
      _avg: { rating: true },
    })

    res.json({
      totalEmployees,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      pendingExtensions,
      pendingApprovals,
      avgCompletionPct,
      departmentBreakdown,
      feedbackCount,
      avgRating: avgRatingResult._avg.rating ? Math.round(avgRatingResult._avg.rating * 10) / 10 : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router