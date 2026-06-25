import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StarIcon({ filled }) {
  return (
    <span 
      className="material-symbols-outlined" 
      style={{ 
        color: filled ? COLORS.amber : "#c2c6d4",
        fontVariationSettings: "'FILL' " + (filled ? "1" : "0") + ", 'wght' 400, 'GRAD' 0, 'opsz' 24",
        fontSize: 20
      }}
    >
      star
    </span>
  );
}

export default function AdminReviews() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/reviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review deleted successfully!");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  }

  return (
    <>
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#EEF2F7", fontFamily: "'Inter', sans-serif" }}>
        
        {/* Top Navbar */}
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
                onClick={() => navigate("/admin-dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: "none",
                  background: "#f0f3ff",
                  color: COLORS.primary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>dashboard</span>
                Dashboard
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button 
                onClick={() => navigate("/admin-dashboard")}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: COLORS.primary, padding: 0 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>Back to Dashboard</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.onSurface, margin: "8px 0 0" }}>User Reviews</h1>
            <p style={{ fontSize: 14, color: COLORS.onSurfaceVariant, margin: 0 }}>
              Read and manage feedback submitted by candidates using the Intervix mock interview platform.
            </p>
          </header>

          {error && (
            <div style={{ background: COLORS.errorBg, color: COLORS.error, padding: "12px 16px", borderRadius: 12, border: `1px solid ${COLORS.error}30`, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e7eeff", padding: 40, textAlign: "center", color: COLORS.onSurfaceVariant }}>
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e7eeff", padding: 40, textAlign: "center", color: COLORS.onSurfaceVariant, fontSize: 14 }}>
              No reviews have been submitted yet.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
              {reviews.map((rev) => (
                <div
                  key={rev.review_id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #e7eeff",
                    boxShadow: "0 4px 20px rgba(13,92,107,0.04)",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 16
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    
                    {/* Header: User name + Stars */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.onSurface, margin: 0 }}>{rev.userName}</h3>
                        <span style={{ fontSize: 11, color: COLORS.onSurfaceVariant }}>{rev.userEmail}</span>
                      </div>
                      <div style={{ display: "flex", gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon key={star} filled={star <= rev.rating} />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p style={{ fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                      "{rev.review_text}"
                    </p>

                  </div>

                  {/* Footer: Date + Action */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f3ff", paddingTop: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.onSurfaceVariant }}>
                      {formatDate(rev.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.review_id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: COLORS.error,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 6,
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.errorBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </>
  );
}
