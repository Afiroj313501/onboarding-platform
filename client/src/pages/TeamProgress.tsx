import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface TeamMember {
  employeeId: string
  name: string
  email: string
  position: string | null
  department: string | null
  totalTasks: number
  completedTasks: number
  completionPct: number
}

function TeamProgress() {
  const { data, isLoading, isError, error } = useQuery<{ team: TeamMember[] }>({
    queryKey: ['teamProgress'],
    queryFn: () => api.get('/manager/team-progress').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading team progress...</p>
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Team progress</h2>
        <div className="bg-danger-tint border border-danger/20 rounded-lg p-5">
          <p className="text-sm text-danger font-medium">Couldn't load team progress</p>
          <p className="text-sm text-body mt-1">
            {(error as any)?.response?.data?.message || 'Something went wrong.'}
          </p>
        </div>
      </div>
    )
  }

  if (!data?.team.length) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-6">Team progress</h2>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-body text-sm">No team members yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Team progress</h2>
        <p className="text-muted text-sm mt-1">
          {data.team.length} team member{data.team.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {data.team.map((member) => (
          <div
            key={member.employeeId}
            className="bg-surface border border-border rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-ink text-sm">{member.name}</p>
                <p className="text-muted text-xs mt-0.5">
                  {member.position || 'No position set'}
                  {member.department && ` · ${member.department}`}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand">
                {member.completionPct}%
              </span>
            </div>

            <div className="h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
                style={{ width: `${member.completionPct}%` }}
              />
            </div>

            <p className="text-muted text-xs mt-2">
              {member.completedTasks} of {member.totalTasks} tasks completed
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamProgress