import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

function DocumentQA() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Ask me anything about company documents — policies, handbooks, or anything HR has uploaded and indexed.",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const askQuestion = useMutation({
    mutationFn: (question: string) => api.post('/ai/ask-documents', { question }).then((res) => res.data),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." },
      ])
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || askQuestion.isPending) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    askQuestion.mutate(trimmed)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Document Q&A</h2>
        <p className="text-muted text-sm mt-1">
          Ask questions and get answers sourced directly from company documents.
        </p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-bg text-body border border-border'
                }`}
              >
                <p>{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                    {msg.sources.map((s, si) => (
                      <span
                        key={si}
                        className="text-xs px-2 py-0.5 rounded-full bg-brand-tint text-brand border border-brand-border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {askQuestion.isPending && (
            <div className="flex justify-start">
              <div className="bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-muted">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a company document..."
            className="flex-1 border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
          />
          <button
            type="submit"
            disabled={!input.trim() || askQuestion.isPending}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default DocumentQA