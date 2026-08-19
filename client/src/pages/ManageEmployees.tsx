import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface UnassignedUser {
  id: string
  name: string
  email: string
  role: string
}

interface Employee {
  id: string
  position: string | null
  department: string | null
  onboardingDone: boolean
  user: {
    name: string
    email: string
  }
}

function ManageEmployees() {
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')

  const { data: employeesData, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ['employees'],
    queryFn: () => api.get('/employees').then((res) => res.data),
  })

  const { data: unassignedData, isLoading: unassignedLoading } = useQuery<{ users: UnassignedUser[] }>({
    queryKey: ['unassignedUsers'],
    queryFn: () => api.get('/employees/unassigned').then((res) => res.data),
  })

  const addEmployee = useMutation({
    mutationFn: () =>
      api.post('/employees', {
        userId: selectedUserId,
        position: position || undefined,
        department: department || undefined,
      }),
    onSuccess: () => {
      setSelectedUserId('')
      setPosition('')
      setDepartment('')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['unassignedUsers'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    addEmployee.mutate()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Manage employees</h2>
        <p className="text-muted text-sm mt-1">
          Add users to your company as employees to unlock onboarding tasks.
        </p>
      </div>

      {/* Add employee form */}
      <div className="bg-surface border border-border rounded-lg p-5 mb-8">
        <h3 className="text-sm font-medium text-ink mb-4">Add an employee</h3>

        {unassignedLoading ? (
          <p className="text-muted text-sm">Loading users...</p>
        ) : !unassignedData?.users.length ? (
          <p className="text-muted text-sm">
            No unassigned users available. Everyone is already an employee.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-border rounded-md p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
                required
              >
                <option value="">Select a user...</option>
                {unassignedData.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Position <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Department <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                  className="w-full border border-border rounded-md p-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addEmployee.isPending || !selectedUserId}
              className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
            >
              {addEmployee.isPending ? 'Adding...' : 'Add as employee'}
            </button>

            {addEmployee.isError && (
              <p className="text-danger text-sm">
                {(addEmployee.error as any)?.response?.data?.message || 'Something went wrong.'}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Employee list */}
      <div>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Current employees
        </h3>

        {employeesLoading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : !employeesData?.employees.length ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-body text-sm">No employees yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {employeesData.employees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink text-sm">{emp.user.name}</p>
                  <p className="text-muted text-xs mt-0.5">{emp.user.email}</p>
                </div>
                <div className="text-right">
                  {emp.position && (
                    <p className="text-sm text-body">{emp.position}</p>
                  )}
                  {emp.department && (
                    <p className="text-xs text-muted mt-0.5">{emp.department}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageEmployees