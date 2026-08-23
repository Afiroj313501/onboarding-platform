import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { askGemini } from '../services/gemini.service'
import prisma from '../prisma/client'
import fs from 'fs'
import path from 'path'
import { PDFParse } from 'pdf-parse'
import { chunkText } from '../services/chunk.service'
import { embedText } from '../services/gemini.service'
const router = Router()

function requireHrAdmin(req: any, res: any, next: any) {
  if (req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'HR Admin access required' })
  }
  next()
}

function requireManager(req: any, res: any, next: any) {
  if (req.user.role !== 'MANAGER' && req.user.role !== 'HR_ADMIN') {
    return res.status(403).json({ message: 'Manager access required' })
  }
  next()
}

// POST /api/ai/generate-tasks - suggest onboarding tasks for a role
router.post('/generate-tasks', authMiddleware, requireHrAdmin, async (req: any, res) => {
  try {
    const { role, department, notes } = req.body

    if (!role || !role.trim()) {
      return res.status(400).json({ message: 'Role is required' })
    }

    const prompt = `Generate a list of 5-8 onboarding tasks for a new employee starting as a "${role}"${
      department ? ` in the ${department} department` : ''
    }.${notes ? ` Additional context: ${notes}` : ''}

Respond ONLY with valid JSON, no markdown formatting, no code fences, no preamble. Use this exact structure:
[
  { "title": "short task title", "description": "one sentence description", "priority": "low" | "medium" | "high" }
]`

    const raw = await askGemini(prompt)

    // Clean up in case the model wraps it in code fences despite instructions
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let tasks
    try {
      tasks = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleaned)
      return res.status(500).json({ message: 'AI response could not be parsed. Please try again.' })
    }

    res.json({ tasks })
  } catch (error) {
    console.error('AI task generation error:', error)
    res.status(500).json({ message: 'Failed to generate tasks. Please try again.' })
  }
})

// POST /api/ai/analyze-feedback - AI summary of company feedback trends
router.post('/analyze-feedback', authMiddleware, requireManager, async (req: any, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!manager?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { user: { companyId: manager.companyId } },
      select: { content: true, rating: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    if (feedbacks.length === 0) {
      return res.json({
        summary: null,
        message: 'No feedback available to analyze yet.',
      })
    }

    const feedbackText = feedbacks
      .map((f, i) => `${i + 1}. ${f.rating ? `[${f.rating}/5] ` : ''}${f.content}`)
      .join('\n')

    const prompt = `You are analyzing employee onboarding feedback for a company. Here is the raw feedback data:

${feedbackText}

Analyze this feedback and respond ONLY with valid JSON, no markdown formatting, no code fences. Use this exact structure:
{
  "overallSentiment": "positive" | "mixed" | "negative",
  "summary": "2-3 sentence overview of the general sentiment and key patterns",
  "commonThemes": ["theme 1", "theme 2", "theme 3"],
  "concerns": ["concern 1", "concern 2"],
  "strengths": ["strength 1", "strength 2"]
}

If there are no clear concerns or strengths, use an empty array for that field.`

    const raw = await askGemini(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let analysis
    try {
      analysis = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('Failed to parse AI feedback analysis:', cleaned)
      return res.status(500).json({ message: 'AI response could not be parsed. Please try again.' })
    }

    res.json({ summary: analysis, feedbackCount: feedbacks.length })
  } catch (error) {
    console.error('AI feedback analysis error:', error)
    res.status(500).json({ message: 'Failed to analyze feedback. Please try again.' })
  }
})

// POST /api/ai/summarize-document/:id - generate an AI summary of a document
router.post('/summarize-document/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document || document.companyId !== user.companyId) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // If already summarized, return the cached summary
    if (document.summary) {
      return res.json({ summary: document.summary, cached: true })
    }

    // Only support PDFs for now
    if (!document.fileUrl.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF documents can be summarized right now' })
    }

    const filePath = path.join(__dirname, '../../', document.fileUrl)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const parser = new PDFParse({ data: fileBuffer })
    let text: string
    try {
      const pdfData = await parser.getText()
      text = pdfData.text.slice(0, 15000)
    } finally {
      await parser.destroy()
    }

    if (!text.trim()) {
      return res.status(400).json({ message: 'Could not extract text from this PDF' })
    }

    const prompt = `Summarize the following company document in 3-5 concise bullet points, focusing on the most important information an employee should know. Respond in plain text with each point on its own line starting with "- ".

Document content:
${text}`

    const summary = await askGemini(prompt)

    await prisma.document.update({
      where: { id },
      data: { summary },
    })

    res.json({ summary, cached: false })
  } catch (error) {
    console.error('Document summarization error:', error)
    res.status(500).json({ message: 'Failed to summarize document. Please try again.' })
  }
})

// POST /api/ai/index-document/:id - chunk + embed a document for Q&A
router.post('/index-document/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document || document.companyId !== user.companyId) {
      return res.status(404).json({ message: 'Document not found' })
    }

    const existingChunks = await prisma.documentChunk.count({ where: { documentId: id } })
    if (existingChunks > 0) {
      return res.json({ message: 'Document already indexed', chunkCount: existingChunks })
    }

    if (!document.fileUrl.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF documents can be indexed right now' })
    }

    const filePath = path.join(__dirname, '../../', document.fileUrl)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(fileBuffer)
    const chunks = chunkText(pdfData.text)

    if (chunks.length === 0) {
      return res.status(400).json({ message: 'No usable text found in this document' })
    }

    for (const chunk of chunks) {
      const embedding = await embedText(chunk)
      const vectorLiteral = `[${embedding.join(',')}]`

      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
        id,
        chunk,
        vectorLiteral
      )
    }

    res.json({ message: 'Document indexed', chunkCount: chunks.length })
  } catch (error) {
    console.error('Document indexing error:', error)
    res.status(500).json({ message: 'Failed to index document. Please try again.' })
  }
})

// POST /api/ai/ask-documents - RAG Q&A across all indexed company documents
router.post('/ask-documents', authMiddleware, async (req: any, res) => {
  try {
    const { question } = req.body
    const userId = req.user.userId

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) {
      return res.status(400).json({ message: 'You are not linked to a company yet' })
    }

    const questionEmbedding = await embedText(question)
    const vectorLiteral = `[${questionEmbedding.join(',')}]`

    // Find the most similar chunks across documents belonging to this company
    const results: any[] = await prisma.$queryRawUnsafe(
      `SELECT dc.content, dc."documentId", d.title,
              1 - (dc.embedding <=> $1::vector) AS similarity
       FROM "DocumentChunk" dc
       JOIN "Document" d ON dc."documentId" = d.id
       WHERE d."companyId" = $2
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 5`,
      vectorLiteral,
      user.companyId
    )

    if (results.length === 0) {
      return res.json({
        answer: "I don't have any indexed documents to search yet. Ask HR Admin to index some documents first.",
        sources: [],
      })
    }

    const context = results
      .map((r, i) => `[Source: ${r.title}]\n${r.content}`)
      .join('\n\n---\n\n')

    const prompt = `Answer the employee's question using ONLY the context below from company documents. If the answer isn't in the context, say you don't have that information and suggest checking with HR.

Context:
${context}

Question: ${question}`

    const answer = await askGemini(prompt)

    const sources = [...new Set(results.map((r) => r.title))]

    res.json({ answer, sources })
  } catch (error) {
    console.error('Document Q&A error:', error)
    res.status(500).json({ message: 'Failed to answer question. Please try again.' })
  }
})

export default router