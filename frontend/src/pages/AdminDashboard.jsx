import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        dau: 0,
        completedSessions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (!token || role !== "admin") {
            navigate("/login");
            return;
        }
        fetchMetrics();
    }, []);

    async function fetchMetrics() {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/users/admin/metrics", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMetrics(res.data);
        } catch (err) {
            console.error("Failed to fetch admin metrics", err);
            setError(err.response?.data?.message || "Failed to load dashboard metrics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMetrics();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    if (loading && !refreshing) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-slate-400 font-medium">Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-extrabold text-xl">IX</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                                Intervix AI Admin
                            </h1>
                            <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
                                System Controller
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            className={`p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-300 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                            title="Refresh Metrics"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                            </svg>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-rose-600/15 hover:shadow-rose-600/25 active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
                {/* Welcome Message */}
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                        Dashboard Overview
                    </h2>
                    <p className="text-slate-400 text-base">
                        Real-time student engagement, activity logs, and automated mock interview platform statistics.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Metric Cards Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Total Registered Students */}
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-300"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                                Cumulative
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            Total Registered Students
                        </p>
                        <p className="text-4xl font-extrabold text-white mt-2 tracking-tight group-hover:scale-105 transition-transform duration-200 origin-left">
                            {metrics.totalStudents.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-4">
                            All students with role "user" active in the system
                        </p>
                    </div>

                    {/* Card 2: Daily Active Users (DAU) */}
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all duration-300"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Live Now
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            Daily Active Users (DAU)
                        </p>
                        <p className="text-4xl font-extrabold text-white mt-2 tracking-tight group-hover:scale-105 transition-transform duration-200 origin-left">
                            {metrics.dau.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-4">
                            Unique active students today (local time)
                        </p>
                    </div>

                    {/* Card 3: Mock Interview Sessions Completed */}
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all duration-300"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">
                                Completed
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            Mock Sessions Completed
                        </p>
                        <p className="text-4xl font-extrabold text-white mt-2 tracking-tight group-hover:scale-105 transition-transform duration-200 origin-left">
                            {metrics.completedSessions.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-4">
                            Total sessions generated with status "completed"
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
