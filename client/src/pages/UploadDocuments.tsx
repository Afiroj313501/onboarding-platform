import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

function UploadDocuments() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((res) => res.data),
  })

  const uploadDocument = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('file', file as File)
      return api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      setTitle('')
      setFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !file) return
    uploadDocument.mutate()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Upload documents</h2>
        <p className="text-muted text-sm mt-1">
          Company handbooks, policies, and forms for your team.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5 mb-8">
        <h3 className="text-sm font-medium text-ink mb-4">Upload a new document</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Employee Handbook 2026"
              className="w-full border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">File</label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-border rounded-md p-2 text-sm text-ink file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-tint file:text-brand file:text-xs file:font-medium hover:file:bg-brand-border/40"
              required
            />
            <p className="text-xs text-muted mt-1">Max file size: 10MB</p>
          </div>

          <button
            type="submit"
            disabled={uploadDocument.isPending || !title.trim() || !file}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {uploadDocument.isPending ? 'Uploading...' : 'Upload document'}
          </button>

          {uploadDocument.isError && (
            <p className="text-danger text-sm">
              {(uploadDocument.error as any)?.response?.data?.message || 'Upload failed. Please try again.'}
            </p>
          )}
          {uploadDocument.isSuccess && (
            <p className="text-brand text-sm">Document uploaded successfully.</p>
          )}
        </form>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Company documents
        </h3>

        {isLoading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : !data?.documents.length ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <p className="text-body text-sm">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.documents.map((doc) => (
              <a
                key={doc.id}
                href={`http://localhost:5000${doc.fileUrl}`}
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
        )}
      </div>
    </div>
  )
}

export default UploadDocuments
