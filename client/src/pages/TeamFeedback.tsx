import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface FeedbackItem {
  id: string
  content: string
  rating: number | null
  createdAt: string
  user: { name: string; email: string }
}

function TeamFeedback() {
  const { data, isLoading, isError } = useQuery<{ feedbacks: FeedbackItem[] }>({
    queryKey: ['managerFeedback'],
    queryFn: () => api.get('/manager/feedback').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading feedback...</p>
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Team feedback</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">Couldn't load feedback</p>
        </div>
      </div>
    )
  }

  if (!data?.feedbacks.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Team feedback</h2>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No feedback submitted yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Team feedback</h2>
        <p className="text-muted text-sm mt-1">
          {data.feedbacks.length} entr{data.feedbacks.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      <div className="space-y-3">
        {data.feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{fb.user.name}</p>
                <p className="text-body text-sm mt-1">{fb.content}</p>
              </div>
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
    </div>
  )
}

export default TeamFeedback