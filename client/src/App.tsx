import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Documents from './pages/Documents'
import Feedback from './pages/Feedback'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import ManageEmployees from './pages/ManageEmployees'
import TeamProgress from './pages/TeamProgress'
import ApproveTasks from './pages/ApproveTasks'
import TeamFeedback from './pages/TeamFeedback'
import UploadDocuments from './pages/UploadDocuments'
import CreateOnboardingPlan from './pages/CreateOnboardingPlan'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
          <Route path="/team-progress" element={<TeamProgress />} />
          <Route path="/approve-tasks" element={<ApproveTasks />} />
          <Route path="/team-feedback" element={<TeamFeedback />} />
          <Route path="/upload-documents" element={<UploadDocuments />} />
          <Route path="/onboarding-plans" element={<CreateOnboardingPlan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App