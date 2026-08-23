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

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any)
  return result.embedding.values
}