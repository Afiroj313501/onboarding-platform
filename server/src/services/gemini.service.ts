import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

export async function askGemini(prompt: string, systemContext?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

  const fullPrompt = systemContext
    ? `${systemContext}\n\nUser question: ${prompt}`
    : prompt

  const result = await model.generateContent(fullPrompt)
  const response = result.response
  return response.text()
}