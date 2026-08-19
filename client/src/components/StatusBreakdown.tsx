interface StatusBreakdownProps {
  completed: number
  inProgress: number
  pending: number
}

function StatusBreakdown({ completed, inProgress, pending }: StatusBreakdownProps) {
  const total = completed + inProgress + pending

  if (total === 0) {
    return <p className="text-muted text-sm">No tasks to show yet.</p>
  }

  const completedPct = (completed / total) * 100
  const inProgressPct = (inProgress / total) * 100
  const pendingPct = (pending / total) * 100

  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-bg">
        {completedPct > 0 && (
          <div
            className="bg-brand transition-all duration-700 ease-out"
            style={{ width: `${completedPct}%` }}
          />
        )}
        {inProgressPct > 0 && (
          <div
            className="bg-warning transition-all duration-700 ease-out"
            style={{ width: `${inProgressPct}%` }}
          />
        )}
        {pendingPct > 0 && (
          <div
            className="bg-border transition-all duration-700 ease-out"
            style={{ width: `${pendingPct}%` }}
          />
        )}
      </div>

      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand" />
          <span className="text-xs text-body">Completed ({completed})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span className="text-xs text-body">In progress ({inProgress})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-border" />
          <span className="text-xs text-body">Pending ({pending})</span>
        </div>
      </div>
    </div>
  )
}

export default StatusBreakdown