import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import InterviewForm from './pages/InterviewForm'
import InterviewSession from './pages/InterviewSession'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PerformanceReport from './pages/PerformanceReport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/report/:id" element={<PerformanceReport />} />
        <Route path="/interview-form" element={<InterviewForm />} />
        <Route path="/interview/:id" element={<InterviewSession />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App