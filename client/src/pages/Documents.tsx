import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface Doc {
  id: string
  title: string
  fileUrl: string
  createdAt: string
}

interface DocumentsResponse {
  documents: Doc[]
}

function DocumentCard({ doc }: { doc: Doc }) {
  const [summary, setSummary] = useState<string | null>(null)

  const summarize = useMutation({
    mutationFn: () => api.post(`/ai/summarize-document/${doc.id}`).then((res) => res.data),
    onSuccess: (data) => setSummary(data.summary),
  })

  const isPdf = doc.fileUrl.toLowerCase().endsWith('.pdf')

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 hover:bg-brand-tint/40 transition-colors group">
        <a
          href={`http://localhost:5000${doc.fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
        >
          <h3 className="font-medium text-ink group-hover:text-brand">
            {doc.title}
          </h3>
          <p className="text-muted text-xs mt-0.5">
            Added {new Date(doc.createdAt).toLocaleDateString()}
          </p>
        </a>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isPdf && (
            <button
              onClick={() => summarize.mutate()}
              disabled={summarize.isPending}
              className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
            >
              {summarize.isPending ? 'Summarizing...' : summary ? 'Re-summarize' : 'AI summary'}
            </button>
          )}
          <a
            href={`http://localhost:5000${doc.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted group-hover:text-brand font-medium"
          >
            View
          </a>
        </div>
      </div>

      {summary && (
        <div className="border-t border-border bg-brand-tint/30 px-5 py-4">
          <p className="text-xs font-medium text-brand mb-2">AI Summary</p>
          <div className="text-sm text-body whitespace-pre-line">{summary}</div>
        </div>
      )}

      {summarize.isError && (
        <div className="border-t border-border bg-danger-tint px-5 py-3">
          <p className="text-xs text-danger">
            {(summarize.error as any)?.response?.data?.message || 'Failed to summarize.'}
          </p>
        </div>
      )}
    </div>
  )
}

function Documents() {
  const { data, isLoading, isError, error } = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading documents...</p>
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Failed to load documents: {(error as any)?.response?.data?.message || 'Unknown error'}
      </p>
    )
  }

  if (!data?.documents.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Documents</h2>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No documents available yet.</p>
          <p className="text-muted text-xs mt-1">
            Company handbooks and onboarding files will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Documents</h2>
        <p className="text-muted text-sm mt-1">
          {data.documents.length} document{data.documents.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="space-y-2">
        {data.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  )
}

export default Documents