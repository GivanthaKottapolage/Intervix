import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import InterviewForm from './pages/InterviewForm'
import InterviewSession from './pages/InterviewSession'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PerformanceReport from './pages/PerformanceReport'
import AdminReviews from './pages/AdminReviews'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/report/:id" element={<PerformanceReport />} />
        <Route path="/interview-form" element={<InterviewForm />} />
        <Route path="/interview/:id" element={<InterviewSession />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App