import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

interface Profile {
  user: {
    userId: string
    role: string
  }
}

const navConfig = [
  { to: '/dashboard', label: 'Dashboard', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/tasks', label: 'My Tasks', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/documents', label: 'Documents', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/feedback', label: 'Feedback', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/team-progress', label: 'Team Progress', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/approve-tasks', label: 'Approve Tasks', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/team-feedback', label: 'Team Feedback', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/manage-employees', label: 'Manage Employees', roles: ['HR_ADMIN'] },
  { to: '/upload-documents', label: 'Upload Documents', roles: ['HR_ADMIN'] },
]

function Layout() {
  const navigate = useNavigate()

  const { data } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then((res) => res.data),
  })

  const role = data?.user.role

  const visibleNavItems = navConfig.filter(
    (item) => !role || item.roles.includes(role)
  )

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="px-6 py-7 border-b border-border">
          <h1 className="text-lg font-semibold text-ink tracking-tight">
            Onboarding
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {role ? role.replace('_', ' ').toLowerCase() : 'Employee Portal'}
          </p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 pl-4 pr-3 py-2.5 text-sm rounded-md border-l-[3px] transition-colors ${
                  isActive
                    ? 'border-brand bg-brand-tint text-brand font-medium'
                    : 'border-transparent text-body hover:bg-bg hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full text-left pl-4 pr-3 py-2.5 text-sm rounded-md border-l-[3px] border-transparent text-danger hover:bg-danger-tint transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-10">
        <div className="max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout