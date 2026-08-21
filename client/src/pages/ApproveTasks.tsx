import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface PendingTask {
  id: string
  title: string
  description: string | null
  priority: string
  progress: number
  employee: {
    user: { name: string; email: string }
  }
}

function TaskRow({ task }: { task: PendingTask }) {
  const queryClient = useQueryClient()
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [note, setNote] = useState('')

  const approveTask = useMutation({
    mutationFn: () => api.patch(`/manager/tasks/${task.id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerTasks'] })
      queryClient.invalidateQueries({ queryKey: ['teamProgress'] })
    },
  })

  const requestRevision = useMutation({
    mutationFn: () => api.patch(`/manager/tasks/${task.id}/revision`, { note }),
    onSuccess: () => {
      setShowRevisionForm(false)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['managerTasks'] })
    },
  })

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink text-sm">{task.title}</h3>
          <p className="text-muted text-xs mt-1">
            {task.employee.user.name} · {task.employee.user.email}
          </p>
          {task.description && (
            <p className="text-body text-sm mt-2">{task.description}</p>
          )}
          <span className="inline-block text-xs px-2 py-1 rounded-full bg-brand-tint text-brand border border-brand-border font-medium mt-2">
            100% complete — pending review
          </span>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => approveTask.mutate()}
            disabled={approveTask.isPending}
            className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {approveTask.isPending ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => setShowRevisionForm((v) => !v)}
            className="border border-border hover:border-warning text-warning text-xs font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
          >
            Revision needed
          </button>
        </div>
      </div>

      {showRevisionForm && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What needs to be fixed or revisited?"
            className="w-full border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border resize-none"
          />
          <button
            onClick={() => note.trim() && requestRevision.mutate()}
            disabled={!note.trim() || requestRevision.isPending}
            className="bg-warning hover:opacity-90 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {requestRevision.isPending ? 'Sending...' : 'Send back for revision'}
          </button>
        </div>
      )}
    </div>
  )
}

function ApproveTasks() {
  const { data, isLoading, isError } = useQuery<{ tasks: PendingTask[] }>({
    queryKey: ['managerTasks'],
    queryFn: () => api.get('/manager/tasks').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading pending tasks...</p>
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Approve tasks</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">Couldn't load tasks</p>
        </div>
      </div>
    )
  }

  if (!data?.tasks.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Approve tasks</h2>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No tasks waiting for approval.</p>
          <p className="text-muted text-xs mt-1">
            Tasks marked 100% complete by employees will show up here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Approve tasks</h2>
        <p className="text-muted text-sm mt-1">
          {data.tasks.length} task{data.tasks.length !== 1 ? 's' : ''} waiting for approval
        </p>
      </div>

      <div className="space-y-3">
        {data.tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default ApproveTasks