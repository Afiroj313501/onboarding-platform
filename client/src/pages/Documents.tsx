import { useQuery } from '@tanstack/react-query'
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
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Documents</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">
            Couldn't load documents
          </p>
          <p className="text-sm text-body mt-1">
            {(error as any)?.response?.data?.message ||
              'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
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
          <a
            key={doc.id}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-surface border border-border rounded-lg px-5 py-4 hover:border-brand-border hover:bg-brand-tint/40 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-ink group-hover:text-brand">
                {doc.title}
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Added {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="text-xs text-muted group-hover:text-brand font-medium">
              View →
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Documents