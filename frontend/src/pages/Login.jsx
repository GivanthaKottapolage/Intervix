import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// --- small inline icons (no external icon font needed) ---
function SparkIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2z" />
    </svg>
  )
}

function ArrowIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}



export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isSignIn = mode === 'signin'

  const switchMode = (next) => {
    setMode(next)
    setError('')
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/users/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('userId', res.data.userId)
      navigate(res.data.role === 'admin' ? '/admin-dashboard' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/users', { fullName, email, password, role })
      setPassword('')
      switchMode('signin')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef2fb] text-[#0b1c30]">
      {/* soft ambient glow — gives the flat background some depth without an actual <canvas> */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#00488d]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[460px] h-[460px] rounded-full bg-[#006a61]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full bg-[#a8c8ff]/20 blur-3xl" />
      </div>

      <main className="relative min-h-screen flex items-start justify-center px-4 md:px-16 py-12 md:py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full items-start">

          {/* Left hero section */}
          <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00488d] to-[#006a61] rounded-lg flex items-center justify-center">
                <SparkIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#00488d]">Intervix</span>
            </div>

            <div className="inline-flex w-fit">
              <span className="bg-[#e5eeff] border border-[#c2c6d4]/50 px-3 py-1 rounded-full text-xs font-semibold text-[#006a61] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse" />
                AI-Powered Interview Coach
              </span>
            </div>

            <h1 className="text-[40px] md:text-[48px] font-bold leading-[1.1] tracking-tight">
              Land Your <br />
              <span className="bg-gradient-to-br from-[#00488d] to-[#006a61] bg-clip-text text-transparent">
                Dream Job
              </span>{' '}
              <br />
              With AI
            </h1>

            <p className="text-lg text-[#424752] max-w-lg">
              Practice interviews, receive instant feedback, improve communication skills,
              and get career-ready with AI-powered coaching.
            </p>

            <div className="flex flex-wrap gap-12 mt-2">
              <div>
                <p className="text-2xl font-semibold">10,000+</p>
                <p className="text-xs text-[#424752]">Interviews Completed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">95%</p>
                <p className="text-xs text-[#424752]">User Satisfaction</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">500+</p>
                <p className="text-xs text-[#424752]">Partner Companies</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2">
              <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm">
                <p className="text-xs text-[#424752] mb-1">Questions Generated</p>
                <p className="text-2xl font-semibold">10</p>
                <p className="text-xs text-[#00488d] mt-1">From your CV</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm">
                <p className="text-xs text-[#424752] mb-1">Confidence Score</p>
                <p className="text-2xl font-semibold">92%</p>
                <p className="text-xs text-[#006a61] mt-1">AI Evaluated</p>
              </div>
            </div>
          </div>

          {/* Right auth card */}
          <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white border border-[#c2c6d4]/30 rounded-[1.5rem] p-6 md:p-7 flex flex-col gap-5 shadow-xl">

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#00488d] to-[#006a61] rounded-lg flex items-center justify-center">
                    <SparkIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-lg font-bold">Intervix</span>
                </div>

                <div className="w-full bg-[#eff4ff] p-1 rounded-xl flex border border-[#c2c6d4]/20">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      isSignIn
                        ? 'bg-white shadow-sm border border-[#c2c6d4]/10 text-[#0b1c30]'
                        : 'text-[#424752] hover:text-[#0b1c30]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      !isSignIn
                        ? 'bg-white shadow-sm border border-[#c2c6d4]/10 text-[#0b1c30]'
                        : 'text-[#424752] hover:text-[#0b1c30]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {isSignIn ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-[#424752]">
                  {isSignIn
                    ? 'Sign in to continue your journey'
                    : 'Start practicing with your AI interview coach'}
                </p>
              </div>

              {error && (
                <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg -mt-2">{error}</p>
              )}

              <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
                {!isSignIn && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-2.5 placeholder:text-[#727783] focus:outline-none focus:ring-2 focus:ring-[#005db5]/20 focus:border-[#00488d] focus:bg-white transition-all"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-2.5 placeholder:text-[#727783] focus:outline-none focus:ring-2 focus:ring-[#005db5]/20 focus:border-[#00488d] focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-2.5 placeholder:text-[#727783] focus:outline-none focus:ring-2 focus:ring-[#005db5]/20 focus:border-[#00488d] focus:bg-white transition-all"
                  />
                </div>

                {!isSignIn && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium" htmlFor="role">Role</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#005db5]/20 focus:border-[#00488d] focus:bg-white transition-all"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                {isSignIn && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#c2c6d4] text-[#00488d]" />
                      <span className="text-xs text-[#424752]">Remember me</span>
                    </label>
                    <a href="#" className="text-xs font-medium text-[#00488d] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,72,141,0.3)] disabled:opacity-60"
                >
                  {loading ? 'Please wait…' : isSignIn ? 'Sign In' : 'Create Account'}
                  {!loading && <ArrowIcon className="w-5 h-5" />}
                </button>
              </form>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[#c2c6d4]/30" />
                <span className="flex-shrink mx-4 text-[10px] font-bold tracking-widest text-[#727783] uppercase">
                  or continue with
                </span>
                <div className="flex-grow border-t border-[#c2c6d4]/30" />
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  className="w-full bg-white border border-[#c2c6d4]/50 hover:bg-[#eff4ff] py-2.5 rounded-lg flex items-center justify-center gap-3 text-sm font-medium transition-all shadow-sm"
                >
                  <img
                    alt="Google"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbYlJDFyn96FIM4GYMPQwiCDhs6b67NTDdinE38RdvaJ_moaDVrOsTRXxfbXDmY5CgGTMf0aoUz74yi72DUGWGBpjP5CGtYoCEhBbp6xC5rbqSzjAC-PJype84aiHsxEpvcvL8pvJ5eKFDyQuRC3svK6l-xayVILC1tUkLnwKVAz9ZJDPdVh_ividrrJRO-vF9VOewidtEagsJtyJPFqDNxaMjVldGfJo4r91vIS92lE_RGV5H9DjO_YGYynVHeraxNq_-wVnNE1eS"
                  />
                  Continue with Google
                </button>
                
              </div>

              <p className="text-center text-sm text-[#424752]">
                {isSignIn ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="text-[#00488d] font-bold hover:underline">
                      Create one
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="text-[#00488d] font-bold hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative w-full py-8 border-t border-[#c2c6d4]/20 bg-[#eff4ff]/60 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#424752]">© 2024 Intervix AI. Engineering Tomorrow's Careers.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-[#424752] hover:text-[#0b1c30] transition-all">Privacy Policy</a>
            <a href="#" className="text-xs text-[#424752] hover:text-[#0b1c30] transition-all">Terms of Service</a>
            <a href="#" className="text-xs text-[#424752] hover:text-[#0b1c30] transition-all">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}