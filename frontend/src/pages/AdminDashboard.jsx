import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const COLORS = {
  primary: "#0d5c6b",
  green: "#10b981",
  amber: "#f59e0b",
  error: "#ba1a1a",
  errorBg: "#ffdad6",
  surfaceContainer: "#e7eeff",
  onSurfaceVariant: "#3f484b",
  onSurface: "#111c2d",
};

function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function exportSessionsCsv(sessions) {
  const headers = ["Student Name", "Job Role", "Industry", "Experience", "Status", "Questions", "Date"];
  const rows = sessions.map((s) => [
    s.studentName,
    s.jobRole,
    s.industry,
    s.experience,
    s.status,
    s.questions,
    formatDate(s.date),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `intervix-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg,#f0f3ff 25%,#e7eeff 50%,#f0f3ff 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonLoad 1.5s infinite",
        borderRadius: 4,
        ...style,
      }}
    />
  );
}

function PulsingDot() {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: COLORS.green,
        display: "inline-block",
        animation: "pulse 2s infinite",
      }}
    />
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: { bg: "#10b98120", color: COLORS.green, border: "#10b98133", label: "Completed" },
    in_progress: { bg: "#f59e0b20", color: COLORS.amber, border: "#f59e0b33", label: "In Progress" },
    pending: { bg: "#94a3b820", color: "#64748b", border: "#94a3b833", label: "Pending" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        padding: "2px 10px",
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {s.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        padding: "2px 10px",
        backgroundColor: isAdmin ? "#0d5c6b20" : "#94a3b820",
        color: isAdmin ? COLORS.primary : "#64748b",
        border: `1px solid ${isAdmin ? "#0d5c6b33" : "#94a3b833"}`,
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {role}
    </span>
  );
}

function StatCard({ icon, badge, label, target, loaded }) {
  const count = useCountUp(target, 1200, loaded);
  const isLive = badge === "live";
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(13,92,107,0.07)",
        border: "1px solid #e7eeff",
        padding: 24,
        transition: "transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: isLive ? "#10b98115" : "#0d5c6b15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLive ? COLORS.green : COLORS.primary,
            fontSize: 26,
          }}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {isLive ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#10b98115",
              border: "1px solid #10b98130",
              borderRadius: 8,
              padding: "4px 10px",
            }}
          >
            <PulsingDot />
            <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.green, textTransform: "uppercase" }}>Live Now</span>
          </div>
        ) : (
          <span
            style={{
              backgroundColor: COLORS.surfaceContainer,
              border: `1px solid ${COLORS.primary}20`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 700,
              color: COLORS.primary,
              textTransform: "uppercase",
            }}
          >
            {badge === "cumulative" ? "Cumulative" : "Completed"}
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </p>
      {loaded ? (
        <p style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary, lineHeight: 1.1 }}>
          {count.toLocaleString()}
        </p>
      ) : (
        <Skeleton style={{ height: 36, width: 112, marginTop: 4 }} />
      )}
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: COLORS.surfaceContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: COLORS.primary,
        fontSize: 11,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function SessionsTable({ sessions, loading, onExport }) {
  const cols = ["Student Name", "Job Role", "Industry", "Experience", "Status", "Questions", "Date"];
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(13,92,107,0.07)", border: "1px solid #e7eeff", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e7eeff", display: "flex", justifycontent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.onSurface, margin: 0 }}>All Student Sessions</h2>
          <p style={{ fontSize: 12, color: COLORS.onSurfaceVariant, margin: "2px 0 0" }}>Monitoring real-time interview performance</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={loading || sessions.length === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: COLORS.primary,
            fontSize: 13,
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: loading || sessions.length === 0 ? "not-allowed" : "pointer",
            opacity: loading || sessions.length === 0 ? 0.5 : 1,
          }}
        >
          Export CSV <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f3ff80" }}>
              {cols.map((c) => (
                <th
                  key={c}
                  style={{
                    padding: "12px 24px",
                    textAlign: c === "Questions" ? "center" : "left",
                    fontSize: 10,
                    fontWeight: 700,
                    color: COLORS.onSurfaceVariant,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #f0f3ff" }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} style={{ padding: "16px 24px" }}>
                        <Skeleton style={{ height: 16, width: j === 4 ? 80 : 96 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : sessions.length === 0
                ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 40, color: COLORS.onSurfaceVariant, fontSize: 14 }}>
                        No sessions found.
                      </td>
                    </tr>
                  )
                : sessions.map((s) => (
                    <tr
                      key={s.id}
                      style={{ borderTop: "1px solid #f0f3ff", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9f9ff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "14px 24px", fontWeight: 600, color: COLORS.onSurface, fontSize: 14 }}>{s.studentName}</td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14 }}>{s.jobRole}</td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14 }}>{s.industry}</td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14 }}>{s.experience}</td>
                      <td style={{ padding: "14px 24px" }}><StatusBadge status={s.status} /></td>
                      <td style={{ padding: "14px 24px", textAlign: "center", color: COLORS.onSurface, fontSize: 14 }}>{s.questions}</td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14, whiteSpace: "nowrap" }}>{formatDate(s.date)}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTable({ users, loading }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(13,92,107,0.07)", border: "1px solid #e7eeff", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e7eeff" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.onSurface, margin: 0 }}>Registered Users</h2>
        <p style={{ fontSize: 12, color: COLORS.onSurfaceVariant, margin: "2px 0 0" }}>Full user base directory and roles</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f3ff80" }}>
              {["Full Name", "Email Address", "Role", "Joined Date"].map((c) => (
                <th key={c} style={{ padding: "12px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: COLORS.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #f0f3ff" }}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} style={{ padding: "16px 24px" }}>
                        <Skeleton style={{ height: 16, width: j === 0 ? 140 : j === 1 ? 200 : j === 2 ? 64 : 100 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : users.length === 0
                ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: 40, color: COLORS.onSurfaceVariant, fontSize: 14 }}>
                        No users found.
                      </td>
                    </tr>
                  )
                : users.map((u) => (
                    <tr
                      key={u.email}
                      style={{ borderTop: "1px solid #f0f3ff", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9f9ff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar name={u.name} />
                          <span style={{ fontWeight: 600, color: COLORS.onSurface, fontSize: 14 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14 }}>{u.email}</td>
                      <td style={{ padding: "14px 24px" }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding: "14px 24px", color: COLORS.onSurfaceVariant, fontSize: 14 }}>{formatDate(u.joinedDate)}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onClose }) {
  return (
    <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "100%", maxWidth: 560, padding: "0 24px" }}>
      <div style={{ background: COLORS.errorBg, color: COLORS.error, padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${COLORS.error}30`, boxShadow: "0 4px 20px rgba(186,26,26,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>report</span>
          <span style={{ fontSize: 13 }}>{message}</span>
        </div>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.error }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ totalStudents: 0, dau: 0, completedSessions: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoaded(false);
    setError(null);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [metricsRes, sessionsRes, usersRes] = await Promise.all([
        axios.get("/api/users/admin/metrics", { headers }),
        axios.get("/api/sessions/admin/all", { headers }),
        axios.get("/api/users/admin/users", { headers }),
      ]);
      setMetrics(metricsRes.data);
      setSessions(sessionsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard data");
    } finally {
      setTimeout(() => setLoaded(true), 400);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  function handleExportCsv() {
    if (sessions.length === 0) return;
    exportSessionsCsv(sessions);
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.2); } }
        @keyframes skeletonLoad { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#EEF2F7", fontFamily: "'Inter', sans-serif" }}>
        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

        <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "#fff", boxShadow: "0 1px 4px rgba(13,92,107,0.08)", height: 64, display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 22 }}>bolt</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: COLORS.primary, fontSize: 17, lineHeight: 1.1 }}>Intervix</div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.onSurfaceVariant, opacity: 0.6 }}>Admin</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={fetchData}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "#f0f3ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.onSurfaceVariant }}
                title="Refresh"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{ padding: "6px 18px", borderRadius: 9999, border: "none", background: "#ba1a1a15", color: COLORS.error, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 24px 48px", display: "flex", flexDirection: "column", gap: 32 }}>
          <header>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.onSurface }}>Dashboard Overview</h1>
            <p style={{ fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 4, maxWidth: 600 }}>
              Real-time student engagement, activity logs, and automated mock interview platform statistics.
            </p>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            <StatCard icon="school" badge="cumulative" label="Total Registered Students" target={metrics.totalStudents} loaded={loaded} />
            <StatCard icon="bolt" badge="live" label="Daily Active Users (DAU)" target={metrics.dau} loaded={loaded} />
            <StatCard icon="verified" badge="completed" label="Mock Sessions Completed" target={metrics.completedSessions} loaded={loaded} />
          </div>

          <SessionsTable
            sessions={loaded ? sessions : []}
            loading={!loaded}
            onExport={handleExportCsv}
          />
          <UsersTable users={loaded ? users : []} loading={!loaded} />
        </main>

        <footer style={{ background: COLORS.primary, marginTop: 48 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: 17 }}>Intervix</span>
              <span style={{ color: "#ffffff80", fontSize: 11 }}>Admin Portal v2.4</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy Policy", "Security Audit", "Contact Dev"].map((link) => (
                <a key={link} href="#" style={{ color: "#ffffffaa", fontSize: 12, textDecoration: "none" }}>{link}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
