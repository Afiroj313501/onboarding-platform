import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface Employee {
  id: string
  position: string | null
  department: string | null
  user: { name: string; email: string }
}

interface TaskDraft {
  title: string
  description: string
  priority: string
  dueDate: string
}

const emptyTask = (): TaskDraft => ({ title: '', description: '', priority: 'medium', dueDate: '' })

function CreateOnboardingPlan() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [tasks, setTasks] = useState<TaskDraft[]>([emptyTask()])
  const queryClient = useQueryClient()

  const { data: employeesData, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ['employees'],
    queryFn: () => api.get('/employees').then((res) => res.data),
  })

  const createTasks = useMutation({
    mutationFn: () =>
      api.post(`/employees/${selectedEmployeeId}/tasks`, {
        tasks: tasks
          .filter((t) => t.title.trim())
          .map((t) => ({ ...t, dueDate: t.dueDate || null })),
      }),
    onSuccess: () => {
      setTasks([emptyTask()])
      setSelectedEmployeeId('')
      queryClient.invalidateQueries({ queryKey: ['teamProgress'] })
    },
  })

  const updateTask = (index: number, field: keyof TaskDraft, value: string) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  const addTaskRow = () => setTasks((prev) => [...prev, emptyTask()])

  const removeTaskRow = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployeeId) return
    const validTasks = tasks.filter((t) => t.title.trim())
    if (validTasks.length === 0) return
    createTasks.mutate()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink">Create onboarding plan</h2>
        <p className="text-muted text-sm mt-1">
          Assign a set of onboarding tasks to an employee.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-lg p-5"
      >
        <div className="mb-5">
          <label className="block text-sm font-medium text-ink mb-1.5">Employee</label>
          {employeesLoading ? (
            <p className="text-muted text-sm">Loading employees...</p>
          ) : (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full border border-border rounded-md p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
              required
            >
              <option value="">Select an employee...</option>
              {employeesData?.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.name} ({emp.user.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-3 mb-5">
          <label className="block text-sm font-medium text-ink">Onboarding tasks</label>

          {tasks.map((task, i) => (
            <div
              key={i}
              className="border border-border rounded-md p-4 space-y-3 relative"
            >
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTaskRow(i)}
                  className="absolute top-3 right-3 text-muted hover:text-danger text-xs"
                >
                  Remove
                </button>
              )}

              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(i, 'title', e.target.value)}
                placeholder="Task title, e.g. Sign employment contract"
                className="w-full border border-border rounded-md p-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
              />

              <input
                type="text"
                value={task.description}
                onChange={(e) => updateTask(i, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="w-full border border-border rounded-md p-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-border"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(i, 'priority', e.target.value)}
                  className="border border-border rounded-md p-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>

                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => updateTask(i, 'dueDate', e.target.value)}
                  className="border border-border rounded-md p-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTaskRow}
            className="text-sm text-brand font-medium hover:underline"
          >
            + Add another task
          </button>
        </div>

        <button
          type="submit"
          disabled={createTasks.isPending || !selectedEmployeeId}
          className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {createTasks.isPending ? 'Creating...' : 'Create onboarding plan'}
        </button>

        {createTasks.isError && (
          <p className="text-danger text-sm mt-3">
            {(createTasks.error as any)?.response?.data?.message || 'Something went wrong.'}
          </p>
        )}
        {createTasks.isSuccess && (
          <p className="text-brand text-sm mt-3">
            Onboarding plan created successfully.
          </p>
        )}
      </form>
    </div>
  )
}

export default CreateOnboardingPlan