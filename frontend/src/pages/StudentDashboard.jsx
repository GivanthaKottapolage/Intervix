import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link, NavLink } from "react-router-dom";

// --- inline icons (same lightweight approach as the auth page — no icon font dependency) ---
function BoltIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function GridIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function MicIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
function ChartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="20" x2="4" y2="13" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="20" y1="20" x2="20" y2="4" />
    </svg>
  );
}
function DocIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}
function GearIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function HelpIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.5" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}
function LogoutIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function BellIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function StarIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9 5.8 20.3l1.6-6.8L2.2 8.9l6.9-.6z" />
    </svg>
  );
}
function ArrowRightIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function SparkleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: GridIcon },
  { to: "/settings", label: "Settings", icon: GearIcon },
];

function initials(text) {
  if (!text) return "ST";
  const parts = text.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function statusBadge(status) {
  switch (status) {
    case "completed":
      return "bg-[#86f2e4] text-[#006f66]";
    case "in-progress":
      return "bg-[#ffe9b3] text-[#7a5600]";
    default:
      return "bg-[#e5eeff] text-[#00488d]";
  }
}

function getSessionScore(session) {
  if (session.report && typeof session.report.overall_score === 'number') {
    return session.report.overall_score;
  }
  if (session.answers && session.answers.length > 0) {
    const sum = session.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
    return Number((sum / session.answers.length).toFixed(1));
  }
  return null;
}

export default function StudentDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const studentName = localStorage.getItem("name") || "";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role === "admin") {
      navigate("/admin-dashboard");
      return;
    }
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      setLoading(true);
      const res = await axios.get("/api/sessions/my", {
        headers: { Authorization: "Bearer " + token },
      });
      setSessions(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't load your sessions");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  // Stats derived from real session data — no invented numbers.
  const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const activeCount = sessions.length - completedCount;
  const completionRate = sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-[#eef2fb] text-[#0b1c30] flex">
      {/* soft ambient glow, fixed so it doesn't scroll with content */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#00488d]/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#006a61]/8 blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-[#c2c6d4]/30 bg-white/70 backdrop-blur-xl z-20 p-6 gap-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00488d] to-[#006a61] rounded-xl flex items-center justify-center shadow-lg shadow-[#00488d]/10">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#00488d] to-[#006a61] bg-clip-text text-transparent">
            Intervix
          </span>
        </div>

        <Link
          to="/interview-form"
          className="w-full py-3 px-4 mb-2 rounded-xl bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold shadow-lg shadow-[#00488d]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Start New Mock
        </Link>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#00488d]/5 text-[#00488d] font-bold"
                    : "text-[#424752] hover:bg-[#d3e4fe]/40 hover:text-[#0b1c30]"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-[#c2c6d4]/30 pt-4">
          <div className="flex items-center gap-3 p-2 mb-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#00488d]/20 bg-[#e5eeff] flex items-center justify-center font-bold text-[#00488d] text-sm">
              {initials(studentName)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{studentName || "Student"}</span>
              <span className="text-[10px] text-[#006a61] font-bold uppercase tracking-wider">
                {completionRate}% sessions completed
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 text-sm text-left text-[#ba1a1a] hover:text-[#ba1a1a]/80 transition-all"
          >
            <LogoutIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 relative min-h-screen overflow-y-auto px-4 md:px-10 py-8 pb-28 md:pb-10 z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-[32px] font-bold">
              Welcome back{studentName ? `, ${studentName.split(" ")[0]}` : ""}.
            </h1>
            <p className="text-[#424752]">
              {sessions.length > 0
                ? `You have ${activeCount} session${activeCount === 1 ? "" : "s"} in progress. Keep up the momentum.`
                : "Let's get your first mock interview started."}
            </p>
          </div>
          
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-4 lg:col-span-5 bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#424752] uppercase tracking-widest">Sessions Completed</span>
              <span className="px-2 py-0.5 bg-[#86f2e4] text-[#006f66] rounded-full text-[10px] font-bold">LIVE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-bold leading-none bg-gradient-to-br from-[#00488d] to-[#006a61] bg-clip-text text-transparent">
                {completionRate}%
              </span>
              <span className="text-[#006a61] text-sm">
                {completedCount} of {sessions.length} sessions
              </span>
            </div>
            <div className="mt-6">
              <div className="w-full h-2 bg-[#d3e4fe] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-br from-[#00488d] to-[#006a61] transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#424752]">
                <span>Getting started</span>
                <span>Interview ready</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-lg bg-[#00488d]/5 flex items-center justify-center mb-4">
              <ChartIcon className="w-5 h-5 text-[#00488d]" />
            </div>
            <div>
              <span className="text-xs text-[#424752]">Questions Generated</span>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-[11px] text-[#00488d] mt-1 font-semibold">Across all sessions</p>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4 bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-lg bg-[#006a61]/5 flex items-center justify-center mb-4">
              <MicIcon className="w-5 h-5 text-[#006a61]" />
            </div>
            <div>
              <span className="text-xs text-[#424752]">Active Sessions</span>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-[11px] text-[#424752] mt-1">Waiting to be completed</p>
            </div>
          </div>
        </section>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interview history */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Interview History</h2>
            </div>

            {loading ? (
              <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-8 text-center text-sm text-[#424752]">
                Loading your sessions…
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-8 text-center flex flex-col items-center gap-4">
                <p className="text-[#424752]">No sessions yet — start your first mock interview to see it here.</p>
                <Link
                  to="/interview-form"
                  className="inline-flex items-center gap-2 bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold px-6 py-3 rounded-xl"
                >
                  <PlusIcon className="w-5 h-5" />
                  Start New Interview
                </Link>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:border-[#00488d]/20 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#e5eeff] flex items-center justify-center shrink-0 border border-[#c2c6d4]/20 font-bold text-[#00488d]">
                    {initials(session.jobRole || session.fullName)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{session.jobRole || "Interview Session"}</h3>
                    <p className="text-sm text-[#424752] flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      {session.preferedIndustry && <span>• {session.preferedIndustry}</span>}
                      {session.experienceLevel && <span>• {session.experienceLevel}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 md:border-l border-[#c2c6d4]/20 md:pl-6 md:ml-auto">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(session.status)}`}>
                        {session.status || "draft"}
                      </span>
                      {session.status === "completed" && (() => {
                        const score = getSessionScore(session);
                        return score !== null ? (
                          <span className="text-xs font-bold text-[#00488d]">
                            Score: {score}/10
                          </span>
                        ) : null;
                      })()}
                    </div>
                    {session.questions?.length > 0 && (
                      <span className="text-xs text-[#424752] hidden md:inline">
                        {session.questions.length} questions
                      </span>
                    )}
                    {session.status === "completed" ? (
                      <Link
                        to={`/report/${session._id}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#00488d] to-[#006a61] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap"
                      >
                        View Report
                      </Link>
                    ) : (
                      <Link
                        to={`/interview/${session._id}`}
                        className="w-10 h-10 rounded-full border border-[#c2c6d4]/30 hover:border-[#00488d] hover:bg-[#00488d]/5 hover:text-[#00488d] transition-all flex items-center justify-center shrink-0"
                      >
                        <ArrowRightIcon className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar content */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00488d] to-[#006a61]" />
              <div className="flex items-center gap-2 mb-3">
                <SparkleIcon className="w-5 h-5 text-[#00488d]" />
                <h3 className="text-lg font-semibold">AI Coach Tip</h3>
              </div>
              <p className="text-sm text-[#424752] leading-relaxed">
                Use the <strong>STAR method</strong> — Situation, Task, Action, Result — to keep behavioral
                answers structured and easy to follow.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/interview-form"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] transition-colors text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4 text-[#00488d]" />
                  Start a new mock interview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#c2c6d4]/20 flex justify-around py-3 px-4 z-30">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? "text-[#00488d]" : "text-[#424752]"}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* Floating quick-start button */}
      <Link
        to="/interview-form"
        className="hidden md:flex fixed bottom-10 right-10 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#00488d] to-[#006a61] text-white shadow-xl shadow-[#00488d]/30 items-center justify-center hover:scale-110 active:scale-90 transition-all group"
      >
        <BoltIcon className="w-6 h-6" />
        <span className="absolute right-16 bg-[#0b1c30] text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all whitespace-nowrap pointer-events-none">
          Quick Start AI Coach
        </span>
      </Link>
    </div>
  );
}