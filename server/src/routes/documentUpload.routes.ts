import { Router } from 'express'
import multer from 'multer'
import type { Request, Response, NextFunction } from 'express'
import cloudinary from '../config/cloudinary'
import prisma from '../prisma/client'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

function requireHrAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'HR Admin access required' })
  }
  next()
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

function uploadBufferToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'onboarding-documents',
        resource_type: 'raw',
        public_id: `${Date.now()}-${filename}`,
      },
      (error: Error | null, result?: { secure_url?: string }) => {
        if (error || !result?.secure_url) {
          return reject(error ?? new Error('Cloudinary upload failed'))
        }
        resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

router.post(
  '/upload',
  authMiddleware,
  requireHrAdmin,
  upload.single('file'),
  async (req: any, res: Response) => {
    try {
      const { title } = req.body

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }
      if (!title) {
        return res.status(400).json({ message: 'Title is required' })
      }

      const hrUser = await prisma.user.findUnique({ where: { id: req.user.userId } })
      if (!hrUser?.companyId) {
        return res.status(400).json({ message: 'You are not linked to a company yet' })
      }

      const fileUrl = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname)

      const document = await prisma.document.create({
        data: { title, fileUrl, companyId: hrUser.companyId },
      })

      res.status(201).json({ message: 'Document uploaded', document })
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

export default router