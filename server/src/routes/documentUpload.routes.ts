import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

function requireHrAdmin(req: any, res: any, next: any) {
  if (req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'HR Admin access required' })
  }
  next()
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

// POST /api/documents/upload - HR Admin uploads a document
router.post(
  '/upload',
  authMiddleware,
  requireHrAdmin,
  upload.single('file'),
  async (req: any, res) => {
    try {
      const { title } = req.body

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      if (!title) {
        return res.status(400).json({ message: 'Title is required' })
      }

      const hrUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
      })

      if (!hrUser?.companyId) {
        return res.status(400).json({ message: 'You are not linked to a company yet' })
      }

      const fileUrl = `/uploads/${req.file.filename}`

      const document = await prisma.document.create({
        data: {
          title,
          fileUrl,
          companyId: hrUser.companyId,
        },
      })

      res.status(201).json({ message: 'Document uploaded', document })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

export default router