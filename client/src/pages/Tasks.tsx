import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
}

interface TasksResponse {
  tasks: Task[]
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
          <p className="text-sm text-danger font-medium">
            Couldn't load your tasks
          </p>
          <p className="text-sm text-body mt-1">
            {(error as any)?.response?.data?.message ||
              'Something went wrong. Please try again.'}
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
          <div
            key={task.id}
            className="bg-surface border border-border rounded-lg p-5"
          >
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

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border text-xs">
              <span className={`font-medium ${priorityStyle(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
              </span>
              {task.dueDate && (
                <span className="text-muted">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks