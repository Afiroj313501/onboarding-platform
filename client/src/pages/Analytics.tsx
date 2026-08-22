import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface AnalyticsData {
  totalEmployees: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  pendingExtensions: number
  pendingApprovals: number
  avgCompletionPct: number
  departmentBreakdown: {
    department: string
    employeeCount: number
    avgProgress: number
  }[]
  feedbackCount: number
  avgRating: number | null
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: 'brand' | 'warning' | 'danger' | 'ink'
}) {
  const accentStyles = {
    brand: 'text-brand',
    warning: 'text-warning',
    danger: 'text-danger',
    ink: 'text-ink',
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-muted font-medium">{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${accentStyles[accent]}`}>{value}</p>
    </div>
  )
}

function Analytics() {
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => api.get('/employees/analytics').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading analytics...</p>
  }

  if (isError || !data) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Analytics</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">Couldn't load analytics</p>
        </div>
      </div>
    )
  }

  const taskStatusRows = [
    { label: 'Completed', count: data.completedTasks, color: 'bg-brand' },
    { label: 'In progress', count: data.inProgressTasks, color: 'bg-warning' },
    { label: 'Pending', count: data.pendingTasks, color: 'bg-border' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Analytics</h2>
        <p className="text-muted text-sm mt-1">
          Company-wide onboarding performance.
        </p>
      </div>

      {/* Top stat tiles */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatTile label="Employees" value={data.totalEmployees} accent="ink" />
        <StatTile label="Avg. completion" value={`${data.avgCompletionPct}%`} accent="brand" />
        <StatTile label="Pending approvals" value={data.pendingApprovals} accent="warning" />
        <StatTile label="Extension requests" value={data.pendingExtensions} accent="danger" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Task status breakdown */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-ink mb-5">Task status</p>
          <p className="text-2xl font-semibold text-ink mb-4">{data.totalTasks} total tasks</p>

          <div className="space-y-3">
            {taskStatusRows.map((row) => {
              const pct = data.totalTasks > 0 ? Math.round((row.count / data.totalTasks) * 100) : 0
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-body">{row.label}</span>
                    <span className="text-muted">{row.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback summary */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-ink mb-5">Feedback</p>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-semibold text-ink">{data.feedbackCount}</p>
              <p className="text-xs text-muted mt-1">Total submissions</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-brand">
                {data.avgRating !== null ? `${data.avgRating}/5` : '—'}
              </p>
              <p className="text-xs text-muted mt-1">Average rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-sm font-medium text-ink mb-5">By department</p>

        {data.departmentBreakdown.length === 0 ? (
          <p className="text-muted text-sm">No department data yet.</p>
        ) : (
          <div className="space-y-4">
            {data.departmentBreakdown.map((dept) => (
              <div key={dept.department}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-ink">{dept.department}</span>
                  <span className="text-xs text-muted">
                    {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''} · {dept.avgProgress}% avg
                  </span>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${dept.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics