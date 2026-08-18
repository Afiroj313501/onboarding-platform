import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Tasks from './pages/Tasks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<Tasks />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<div className="text-2xl">My Tasks Coming Soon</div>} />
          <Route path="/documents" element={<div className="text-2xl">Documents Coming Soon</div>} />
          <Route path="/feedback" element={<div className="text-2xl">Feedback Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App