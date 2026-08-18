import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface Profile {
  message: string
  user: {
    userId: string
    role: string
  }
}

function Dashboard() {
  const { data, isLoading, isError } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then((res) => res.data),
  })

  if (isLoading) {
    return <p className="text-muted text-sm">Loading your dashboard...</p>
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn't load your profile. Try logging in again.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
        <p className="text-muted text-sm mt-1">
          Here's where your onboarding stands.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-medium">
            Role
          </p>
          <p className="text-lg font-semibold text-ink mt-1 capitalize">
            {data?.user.role.replace('_', ' ').toLowerCase()}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-xs uppercase tracking-wide text-muted font-medium">
            User ID
          </p>
          <p className="text-sm font-medium text-ink mt-1 truncate">
            {data?.user.userId}
          </p>
        </div>
      </div>

      <div className="bg-brand-tint border border-brand-border rounded-lg p-5">
        <p className="text-sm text-brand font-medium">
          Onboarding progress tracking is coming soon.
        </p>
        <p className="text-sm text-body mt-1">
          Once tasks are assigned, you'll see your completion status here.
        </p>
      </div>
    </div>
  )
}

export default Dashboard