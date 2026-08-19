import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface FeedbackItem {
  id: string
  content: string
  rating: number | null
  createdAt: string
}

interface FeedbackResponse {
  feedbacks: FeedbackItem[]
}

function Feedback() {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<FeedbackResponse>({
    queryKey: ['feedback'],
    queryFn: () => api.get('/feedback').then((res) => res.data),
  })

  const submitFeedback = useMutation({
    mutationFn: () => api.post('/feedback', { content, rating }),
    onSuccess: () => {
      setContent('')
      setRating(null)
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    submitFeedback.mutate()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Feedback</h2>
        <p className="text-muted text-sm mt-1">
          Share thoughts on your onboarding experience.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-lg p-5 mb-8"
      >
        <label className="block text-sm font-medium text-ink mb-2">
          Your feedback
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="What is working well? What could be better?"
          className="w-full border border-border rounded-md p-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border resize-none"
          required
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted mr-2">Rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`w-8 h-8 rounded-md border text-sm font-medium transition-colors ${
                  rating === n
                    ? 'bg-brand text-white border-brand'
                    : 'border-border text-muted hover:border-brand-border'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitFeedback.isPending}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {submitFeedback.isPending ? 'Submitting...' : 'Submit feedback'}
          </button>
        </div>

        {submitFeedback.isError && (
          <p className="text-danger text-sm mt-3">
            Something went wrong. Please try again.
          </p>
        )}
      </form>

      <div>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Your feedback history
        </h3>

        {isLoading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : !data?.feedbacks.length ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <p className="text-body text-sm">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-surface border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm text-body">{fb.content}</p>
                  {fb.rating && (
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-tint text-brand border border-brand-border font-medium whitespace-nowrap">
                      {fb.rating}/5
                    </span>
                  )}
                </div>
                <p className="text-muted text-xs mt-2">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feedback