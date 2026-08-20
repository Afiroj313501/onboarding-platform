import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface PendingTask {
  id: string
  title: string
  description: string | null
  priority: string
  employee: {
    user: { name: string; email: string }
  }
}

function ApproveTasks() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<{ tasks: PendingTask[] }>({
    queryKey: ['managerTasks'],
    queryFn: () => api.get('/manager/tasks').then((res) => res.data),
  })

  const approveTask = useMutation({
    mutationFn: (taskId: string) => api.patch(`/manager/tasks/${taskId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerTasks'] })
      queryClient.invalidateQueries({ queryKey: ['teamProgress'] })
    },
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
            Tasks marked "in progress" by employees will show up here.
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
          <div
            key={task.id}
            className="bg-surface border border-border rounded-lg p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-ink text-sm">{task.title}</h3>
                <p className="text-muted text-xs mt-1">
                  {task.employee.user.name} · {task.employee.user.email}
                </p>
                {task.description && (
                  <p className="text-body text-sm mt-2">{task.description}</p>
                )}
              </div>

              <button
                onClick={() => approveTask.mutate(task.id)}
                disabled={approveTask.isPending}
                className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {approveTask.isPending ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApproveTasks