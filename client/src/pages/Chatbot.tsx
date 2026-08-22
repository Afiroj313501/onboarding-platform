import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your onboarding assistant. Ask me anything about your onboarding process, tasks, or general workplace questions.",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const sendMessage = useMutation({
    mutationFn: (message: string) => api.post('/chat', { message }).then((res) => res.data),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
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
    if (!trimmed || sendMessage.isPending) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    sendMessage.mutate(trimmed)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Onboarding assistant</h2>
        <p className="text-muted text-sm mt-1">
          Ask questions about your onboarding, tasks, or company policies.
        </p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-lg flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-bg text-body border border-border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
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

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot