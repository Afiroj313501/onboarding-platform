import { Router } from 'express'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

function requireManager(req: any, res: any, next: any) {
  if (req.user.role !== 'MANAGER' && req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'Manager access required' })
  }
  next()
}

// GET /api/manager/team-progress - employees + their task completion %
router.get('/team-progress', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!manager?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const employees = await prisma.employee.findMany({
      where: { companyId: manager.companyId },
      include: { user: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    })

    const teamProgress = employees.map((emp) => {
      const total = emp.tasks.length
      const completed = emp.tasks.filter((t) => t.status === 'completed').length
      const avgProgress =
        total > 0
          ? Math.round(emp.tasks.reduce((sum, t) => sum + t.progress, 0) / total)
          : 0
      return {
        employeeId: emp.id,
        name: emp.user.name,
        email: emp.user.email,
        position: emp.position,
        department: emp.department,
        totalTasks: total,
        completedTasks: completed,
        completionPct: avgProgress,
      }
    })

    res.json({ team: teamProgress })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/manager/tasks - tasks 100% complete, waiting for approval
router.get('/tasks', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!manager?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const tasks = await prisma.task.findMany({
      where: {
        progress: 100,
        approved: false,
        needsRevision: false,
        employee: { companyId: manager.companyId },
      },
      include: { employee: { include: { user: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ tasks })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/manager/tasks/:id/approve - final approval, closes the task
router.patch('/tasks/:id/approve', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const { id } = req.params
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    const task = await prisma.task.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!task || task.employee.companyId !== manager?.companyId) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: 'completed', approved: true, needsRevision: false, revisionNote: null },
    })

    res.json({ message: 'Task approved', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/manager/tasks/:id/revision - send back with feedback
router.patch('/tasks/:id/revision', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const { id } = req.params
    const { note } = req.body
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'A revision note is required' })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!task || task.employee.companyId !== manager?.companyId) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { needsRevision: true, revisionNote: note },
    })

    res.json({ message: 'Revision requested', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/manager/feedback - all feedback from users in the company
router.get('/feedback', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!manager?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { user: { companyId: manager.companyId } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ feedbacks })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/manager/extension-requests - pending time extension requests
router.get('/extension-requests', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!manager?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const tasks = await prisma.task.findMany({
      where: {
        extensionStatus: 'pending',
        employee: { companyId: manager.companyId },
      },
      include: { employee: { include: { user: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ tasks })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/manager/tasks/:id/extension - approve or reject an extension request
router.patch('/tasks/:id/extension', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const { id } = req.params
    const { approve } = req.body // true or false
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    const task = await prisma.task.findUnique({
      where: { id },
      include: { employee: true },
    })

    if (!task || task.employee.companyId !== manager?.companyId) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        extensionStatus: approve ? 'approved' : 'rejected',
        dueDate: approve && task.requestedDueDate ? task.requestedDueDate : task.dueDate,
      },
    })

    res.json({ message: approve ? 'Extension approved' : 'Extension rejected', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router