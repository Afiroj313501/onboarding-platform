import { useState } from 'react'
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
  { to: '/chatbot', label: 'Assistant', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/document-qa', label: 'Document Q&A', roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'] },
  { to: '/team-progress', label: 'Team Progress', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/approve-tasks', label: 'Approve Tasks', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/team-feedback', label: 'Team Feedback', roles: ['MANAGER', 'HR_ADMIN'] },
  { to: '/manage-employees', label: 'Manage Employees', roles: ['HR_ADMIN'] },
  { to: '/upload-documents', label: 'Upload Documents', roles: ['HR_ADMIN'] },
  { to: '/onboarding-plans', label: 'Onboarding Plans', roles: ['HR_ADMIN'] },
  { to: '/analytics', label: 'Analytics', roles: ['HR_ADMIN'] },
]

function Layout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then((res) => res.data),
  })

  const role = data?.user.role
  const visibleNavItems = navConfig.filter((item) => !role || item.roles.includes(role))

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      navigate('/')
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 py-7 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink tracking-tight">Onboarding</h1>
            <p className="text-xs text-muted mt-0.5">
              {role ? role.replace('_', ' ').toLowerCase() : 'Employee Portal'}
            </p>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden text-muted hover:text-ink"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-ink"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-ink">Onboarding</span>
          <div className="w-6" /> {/* spacer to balance the layout */}
        </header>

        <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
          <div className="max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout