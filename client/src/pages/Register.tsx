import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

interface RegisterProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'EMPLOYEE',
      })

      await api.post('/auth/login', { email, password })

      if (onSuccess) {
        onSuccess()
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-ink mb-6">Create your account</h2>

      {error && (
        <div className="bg-danger-tint border border-danger/20 text-danger text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-md p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-md p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-md p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-border"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-body">
        Already have an account?{' '}
        {onSwitchToLogin ? (
          <button
            onClick={onSwitchToLogin}
            className="text-brand font-medium hover:underline"
          >
            Log in
          </button>
        ) : (
          <Link to="/login" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        )}
      </p>
    </div>
  )
}

export default Register