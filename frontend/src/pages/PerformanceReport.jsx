import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function PerformanceReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedIndex, setExpandedIndex] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchReport();
    }, [id]);

    async function fetchReport() {
        try {
            setLoading(true);
            const res = await axios.get(`/api/sessions/${id}/report`, {
                headers: { Authorization: "Bearer " + token }
            });
            setReportData(res.data);
            if (res.data.answers?.length > 0) {
                setExpandedIndex(0);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load performance report");
        } finally {
            setLoading(false);
        }
    }

    const toggleAccordion = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-slate-400 font-medium">Generating performance report...</p>
            </div>
        );
    }

    if (error || !reportData) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl max-w-md text-center mb-6">
                    <p className="font-semibold text-lg mb-1">Error Loading Report</p>
                    <p className="text-sm">{error || "Interview session not found."}</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const overallScore = reportData.overallScore || 0;
    const scoreColor = overallScore >= 8 
        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
        : overallScore >= 6 
            ? "text-amber-400 border-amber-500/30 bg-amber-500/5"
            : "text-rose-400 border-rose-500/30 bg-rose-500/5";

    const reportMetrics = reportData.report;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
            <div className="max-w-4xl mx-auto px-6 pt-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group font-medium cursor-pointer"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-xl relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                                Completed Session Report
                            </span>
                            <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
                                {reportData.fullName}
                            </h1>
                            <p className="text-slate-400 mt-1 font-medium">
                                Job Applied: <span className="text-indigo-400 font-semibold">{reportData.jobRole}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                Conducted on {new Date(reportData.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Overall Score Circle Card */}
                        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${scoreColor} min-w-[160px] text-center`}>
                            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                                Overall Score
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black tracking-tight">{overallScore}</span>
                                <span className="text-lg font-semibold text-slate-500">/10</span>
                            </div>
                            <span className="text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-full bg-black/20">
                                {overallScore >= 8 ? "Excellent" : overallScore >= 6 ? "Competent" : "Needs Practice"}
                            </span>
                        </div>
                    </div>

                    {/* AI Feedback Report Metrics (If generated) */}
                    {reportMetrics && (
                        <div className="mt-8 pt-8 border-t border-slate-800 grid gap-6 sm:grid-cols-3">
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Technical</span>
                                    <span className="text-sm font-bold text-indigo-400">{reportMetrics.technical?.score}/10</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{reportMetrics.technical?.feedback}</p>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Communication</span>
                                    <span className="text-sm font-bold text-indigo-400">{reportMetrics.communication?.score}/10</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{reportMetrics.communication?.feedback}</p>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Confidence</span>
                                    <span className="text-sm font-bold text-indigo-400">{reportMetrics.confidence?.score}/10</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{reportMetrics.confidence?.feedback}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendations and strengths */}
                {reportMetrics && (
                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-3">
                                🌟 Key Strengths
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                {reportMetrics.strengths?.map((str, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        {str}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-3">
                                🛠️ Growth Areas
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                {reportMetrics.improvements?.map((imp, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">→</span>
                                        {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Q&A Accordion Title */}
                <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
                    Question-by-Question Analysis
                </h2>

                {/* Accordion List */}
                <div className="space-y-4">
                    {reportData.answers?.length === 0 ? (
                        <div className="text-center py-10 bg-slate-900/20 border border-slate-800 rounded-3xl">
                            <p className="text-slate-500">No questions answered in this session.</p>
                        </div>
                    ) : (
                        reportData.answers.map((item, index) => {
                            const isExpanded = expandedIndex === index;
                            const itemScore = item.evaluation?.score || 0;
                            const itemScoreColor = itemScore >= 8 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : itemScore >= 6
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                            return (
                                <div
                                    key={index}
                                    className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-md"
                                >
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer hover:bg-slate-900/80 transition-all duration-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                                    Question {index + 1}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${itemScoreColor}`}>
                                                    Score: {itemScore}/10
                                                </span>
                                            </div>
                                            <h3 className="text-base font-semibold text-white tracking-tight leading-snug">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <div className={`p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Accordion Expandable Content */}
                                    <div
                                        className={`transition-all duration-300 overflow-hidden ${
                                            isExpanded ? "max-h-[1000px] border-t border-slate-800" : "max-h-0"
                                        }`}
                                    >
                                        <div className="p-6 space-y-5 bg-slate-950/20">
                                            {/* Answer Section */}
                                            <div>
                                                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                                    🎙️ Your Transcribed Answer
                                                </h4>
                                                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                                                    <p className="text-slate-300 italic text-sm leading-relaxed">
                                                        "{item.answerText || "No answer recorded."}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Feedback and Tips Section */}
                                            {item.evaluation && (
                                                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                                                            💡 AI Feedback
                                                        </h5>
                                                        <p className="text-xs text-slate-300 leading-relaxed">
                                                            {item.evaluation.feedback || "No feedback generated."}
                                                        </p>
                                                    </div>
                                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                                                            🚀 Improvement Tips
                                                        </h5>
                                                        <p className="text-xs text-slate-300 leading-relaxed">
                                                            {item.evaluation.improvement || "Keep up the good response style."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
