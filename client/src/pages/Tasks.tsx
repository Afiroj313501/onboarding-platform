import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  progress: number
  needsRevision: boolean
  revisionNote: string | null
  dueDate: string | null
  requestedDueDate: string | null
  extensionReason: string | null
  extensionStatus: string
}

interface TasksResponse {
  tasks: Task[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
}

function statusStyle(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-brand-tint text-brand border-brand-border'
    case 'in_progress':
      return 'bg-warning-tint text-warning border-warning/20'
    default:
      return 'bg-bg text-muted border-border'
  }
}

function priorityStyle(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-danger'
    case 'low':
      return 'text-muted'
    default:
      return 'text-warning'
  }
}

function extensionBadge(extensionStatus: string) {
  switch (extensionStatus) {
    case 'pending':
      return { text: 'Extension pending', style: 'bg-warning-tint text-warning border-warning/20' }
    case 'approved':
      return { text: 'Extension approved', style: 'bg-brand-tint text-brand border-brand-border' }
    case 'rejected':
      return { text: 'Extension rejected', style: 'bg-danger-tint text-danger border-danger/20' }
    default:
      return null
  }
}

function TaskCard({ task }: { task: Task }) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showExtensionForm, setShowExtensionForm] = useState(false)
  const [requestedDate, setRequestedDate] = useState('')
  const [reason, setReason] = useState('')

  const { data: commentsData } = useQuery<{ comments: Comment[] }>({
    queryKey: ['taskComments', task.id],
    queryFn: () => api.get(`/tasks/${task.id}/comments`).then((res) => res.data),
    enabled: expanded,
  })

  const updateProgress = useMutation({
    mutationFn: (progress: number) => api.patch(`/tasks/${task.id}/progress`, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const addComment = useMutation({
    mutationFn: (content: string) => api.post(`/tasks/${task.id}/comments`, { content }),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['taskComments', task.id] })
    },
  })

  const requestExtension = useMutation({
    mutationFn: () =>
      api.post(`/tasks/${task.id}/request-extension`, {
        requestedDueDate: requestedDate,
        extensionReason: reason,
      }),
    onSuccess: () => {
      setShowExtensionForm(false)
      setRequestedDate('')
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const badge = extensionBadge(task.extensionStatus)

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      {task.needsRevision && task.revisionNote && (
        <div className="bg-warning-tint border border-warning/20 rounded-md p-3 mb-4">
          <p className="text-xs font-medium text-warning mb-1">Revision requested</p>
          <p className="text-sm text-body">{task.revisionNote}</p>
        </div>
      )}

      <div className="flex justify-between items-start gap-4">
        <h3 className="font-medium text-ink">{task.title}</h3>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${statusStyle(
            task.status
          )}`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {task.description && (
        <p className="text-body text-sm mt-2">{task.description}</p>
      )}

      <div className="flex justify-between items-center mt-4 text-xs">
        <span className={`font-medium ${priorityStyle(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
        </span>
        {task.dueDate && (
          <span className="text-muted">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {badge && (
        <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium mt-2 ${badge.style}`}>
          {badge.text}
        </span>
      )}

      {/* Progress slider */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink">Progress</span>
          <span className="text-xs font-semibold text-brand">{task.progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={task.progress}
          onChange={(e) => updateProgress.mutate(Number(e.target.value))}
          className="w-full accent-[#166534]"
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-body hover:text-ink transition-colors"
        >
          {expanded ? 'Hide comments' : 'View comments'}
        </button>
        {task.extensionStatus !== 'pending' && task.status !== 'completed' && (
          <button
            onClick={() => setShowExtensionForm((v) => !v)}
            className="text-xs font-medium text-brand hover:underline"
          >
            Request more time
          </button>
        )}
      </div>

      {/* Extension request form */}
      {showExtensionForm && (
        <div className="mt-3 p-4 bg-bg rounded-md space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">New due date</label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full border border-border rounded-md p-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need more time?"
              className="w-full border border-border rounded-md p-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <button
            onClick={() => requestExtension.mutate()}
            disabled={!requestedDate || requestExtension.isPending}
            className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {requestExtension.isPending ? 'Submitting...' : 'Submit request'}
          </button>
        </div>
      )}

      {/* Comments section */}
      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            {commentsData?.comments.length ? (
              commentsData.comments.map((c) => (
                <div key={c.id} className="bg-bg rounded-md p-3">
                  <p className="text-sm text-body">{c.content}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted">No comments yet.</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add an update..."
              className="flex-1 border border-border rounded-md p-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
            <button
              onClick={() => commentText.trim() && addComment.mutate(commentText)}
              disabled={!commentText.trim() || addComment.isPending}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Tasks() {
  const { data, isLoading, isError, error } = useQuery<TasksResponse>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading your tasks...</p>
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">My Tasks</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">Couldn't load your tasks</p>
          <p className="text-sm text-body mt-1">
            {(error as any)?.response?.data?.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    )
  }

  if (!data?.tasks.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">My Tasks</h2>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No tasks assigned yet.</p>
          <p className="text-muted text-xs mt-1">
            New tasks from your onboarding plan will show up here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">My Tasks</h2>
        <p className="text-muted text-sm mt-1">
          {data.tasks.length} task{data.tasks.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      <div className="space-y-3">
        {data.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default Tasks