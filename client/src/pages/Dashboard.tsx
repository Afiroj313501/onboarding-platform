import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import ProgressRing from '../components/ProgressRing'
import StatusBreakdown from '../components/StatusBreakdown'

interface Profile {
  message: string
  user: {
    userId: string
    role: string
  }
}

interface Task {
  id: string
  status: string
}

interface TasksResponse {
  tasks: Task[]
}

interface ExtensionRequest {
  id: string
  title: string
  dueDate: string | null
  requestedDueDate: string | null
  extensionReason: string | null
  employee: {
    user: { name: string; email: string }
  }
}

function ExtensionRequestsPanel() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ tasks: ExtensionRequest[] }>({
    queryKey: ['extensionRequests'],
    queryFn: () => api.get('/manager/extension-requests').then((res) => res.data),
  })

  const respond = useMutation({
    mutationFn: ({ taskId, approve }: { taskId: string; approve: boolean }) =>
      api.patch(`/manager/tasks/${taskId}/extension`, { approve }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensionRequests'] })
      queryClient.invalidateQueries({ queryKey: ['teamProgress'] })
    },
  })

  if (isLoading) return null
  if (!data?.tasks.length) return null

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink">Time extension requests</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-warning-tint text-warning border border-warning/20 font-medium">
          {data.tasks.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {data.tasks.map((task) => (
          <div key={task.id} className="border border-border rounded-md p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {task.employee.user.name} · {task.employee.user.email}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-body">
                  {task.dueDate && (
                    <span>Current: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.requestedDueDate && (
                    <span className="text-brand font-medium">
                      Requested: {new Date(task.requestedDueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {task.extensionReason && (
                  <p className="text-sm text-body mt-2">"{task.extensionReason}"</p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => respond.mutate({ taskId: task.id, approve: true })}
                  disabled={respond.isPending}
                  className="bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => respond.mutate({ taskId: task.id, approve: false })}
                  disabled={respond.isPending}
                  className="border border-border hover:border-danger text-danger text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard() {
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then((res) => res.data),
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery<TasksResponse>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data),
    retry: false,
  })

  if (profileLoading) {
    return <p className="text-muted text-sm">Loading your dashboard...</p>
  }

  if (profileError) {
    return (
      <p className="text-danger text-sm">
        Couldn't load your profile. Try logging in again.
      </p>
    )
  }

  const role = profileData?.user.role
  const isManagerOrAdmin = role === 'MANAGER' || role === 'HR_ADMIN'

  const tasks = tasksData?.tasks ?? []
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const completionPct = tasks.length > 0 ? (completed / tasks.length) * 100 : 0

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
        <p className="text-muted text-sm mt-1">
          Here's where your onboarding stands.
        </p>
      </div>

      {isManagerOrAdmin && <ExtensionRequestsPanel />}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-medium">
            Role
          </p>
          <p className="text-lg font-semibold text-ink mt-1 capitalize">
            {role?.replace('_', ' ').toLowerCase()}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-medium">
            User ID
          </p>
          <p className="text-sm font-medium text-ink mt-1 truncate">
            {profileData?.user.userId}
          </p>
        </div>
      </div>

      {tasksLoading ? (
        <div className="bg-surface border border-border rounded-lg p-8 flex justify-center">
          <p className="text-muted text-sm">Loading task progress...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-brand-tint border border-brand-border rounded-lg p-5">
          <p className="text-sm text-brand font-medium">
            No tasks assigned yet.
          </p>
          <p className="text-sm text-body mt-1">
            Once your onboarding plan is set up, your progress will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-ink mb-5">Onboarding progress</p>
          <div className="grid grid-cols-[auto_1fr] gap-8 items-center">
            <ProgressRing percentage={completionPct} label="Complete" />
            <StatusBreakdown completed={completed} inProgress={inProgress} pending={pending} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard