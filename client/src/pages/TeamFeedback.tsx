import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface FeedbackItem {
  id: string
  content: string
  rating: number | null
  createdAt: string
  user: { name: string; email: string }
}

interface AnalysisResult {
  overallSentiment: 'positive' | 'mixed' | 'negative'
  summary: string
  commonThemes: string[]
  concerns: string[]
  strengths: string[]
}

function sentimentStyle(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return 'bg-brand-tint text-brand border-brand-border'
    case 'negative':
      return 'bg-danger-tint text-danger border-danger/20'
    default:
      return 'bg-warning-tint text-warning border-warning/20'
  }
}

function AnalysisPanel() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  const analyze = useMutation({
    mutationFn: () => api.post('/ai/analyze-feedback').then((res) => res.data),
    onSuccess: (data) => {
      if (data.summary) setAnalysis(data.summary)
    },
  })

  return (
    <div className="bg-brand-tint border border-brand-border rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-ink flex items-center gap-2">
          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          AI feedback analysis
        </h3>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {analyze.isPending ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze feedback'}
        </button>
      </div>

      {!analysis && !analyze.isPending && (
        <p className="text-body text-sm mt-3">
          Get an AI-generated summary of trends and themes across all your team's feedback.
        </p>
      )}

      {analyze.isError && (
        <p className="text-danger text-sm mt-3">
          {(analyze.error as any)?.response?.data?.message || 'Failed to analyze feedback.'}
        </p>
      )}

      {analysis && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${sentimentStyle(analysis.overallSentiment)}`}>
              {analysis.overallSentiment}
            </span>
          </div>

          <p className="text-sm text-body bg-surface border border-border rounded-md p-4">
            {analysis.summary}
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Common themes</p>
              {analysis.commonThemes.length ? (
                <ul className="space-y-1">
                  {analysis.commonThemes.map((t, i) => (
                    <li key={i} className="text-sm text-body">· {t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">None identified</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Strengths</p>
              {analysis.strengths.length ? (
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-brand">· {s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">None identified</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Concerns</p>
              {analysis.concerns.length ? (
                <ul className="space-y-1">
                  {analysis.concerns.map((c, i) => (
                    <li key={i} className="text-sm text-danger">· {c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">None identified</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Team feedback</h2>
        <p className="text-muted text-sm mt-1">
          {data?.feedbacks.length ?? 0} entr{data?.feedbacks.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {data && data.feedbacks.length > 0 && <AnalysisPanel />}

      {!data?.feedbacks.length ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No feedback submitted yet.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default TeamFeedback