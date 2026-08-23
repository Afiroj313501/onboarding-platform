// Splits text into overlapping chunks for embedding
export function chunkText(text: string, chunkSize = 1000, overlap = 150): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }

  return chunks.filter((c) => c.trim().length > 50) // skip tiny trailing fragments
}