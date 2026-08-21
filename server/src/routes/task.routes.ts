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

// PATCH /api/tasks/:id/status - employee updates their own task's status
router.patch('/:id/status', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user.userId

    const allowedStatuses = ['pending', 'in_progress', 'completed']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const employee = await prisma.employee.findUnique({ where: { userId } })
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' })
    }

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.employeeId !== employee.id) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
    })

    res.json({ message: 'Task updated', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH /api/tasks/:id/progress - employee updates progress percentage
router.patch('/:id/progress', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const { progress } = req.body
    const userId = req.user.userId

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100' })
    }

    const employee = await prisma.employee.findUnique({ where: { userId } })
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' })
    }

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.employeeId !== employee.id) {
      return res.status(404).json({ message: 'Task not found' })
    }

    let status = task.status
    if (progress === 0) status = 'pending'
    else if (progress === 100) status = 'completed'
    else status = 'in_progress'

    const updated = await prisma.task.update({
      where: { id },
      data: {
        progress,
        status,
        needsRevision: false,
        revisionNote: progress === 100 ? task.revisionNote : null,
      },
    })

    res.json({ message: 'Progress updated', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})
// POST /api/tasks/:id/comments - add a comment to a task
router.post('/:id/comments', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' })
    }

    const comment = await prisma.taskComment.create({
      data: { content, taskId: id },
    })

    res.status(201).json({ message: 'Comment added', comment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/tasks/:id/comments - list comments for a task
router.get('/:id/comments', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/tasks/:id/request-extension - employee requests more time
router.post('/:id/request-extension', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const { requestedDueDate, extensionReason } = req.body
    const userId = req.user.userId

    if (!requestedDueDate) {
      return res.status(400).json({ message: 'Requested due date is required' })
    }

    const employee = await prisma.employee.findUnique({ where: { userId } })
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' })
    }

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.employeeId !== employee.id) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        requestedDueDate: new Date(requestedDueDate),
        extensionReason: extensionReason || null,
        extensionStatus: 'pending',
      },
    })

    res.json({ message: 'Extension requested', task: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router