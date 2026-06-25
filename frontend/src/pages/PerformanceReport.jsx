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

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-[#EEF2F7] flex flex-col items-center justify-center text-[#111c2d]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D5C6B] mb-4"></div>
                <p className="text-[#3f484b] font-medium">Generating performance report...</p>
            </div>
        );
    }

    // Error State
    if (error || !reportData) {
        return (
            <div className="min-h-screen bg-[#EEF2F7] flex flex-col items-center justify-center p-6 text-[#111c2d]">
                <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl max-w-md text-center mb-6 shadow-sm">
                    <p className="font-semibold text-lg mb-1">Error Loading Report</p>
                    <p className="text-sm">{error || "Interview session not found."}</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#0D5C6B] hover:bg-[#00434f] text-white font-semibold px-6 py-3 rounded-2xl transition shadow-md"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const overallScore = reportData.overallScore || 0;
    
    const scoreColor = overallScore >= 8 
        ? "border-emerald-500 text-emerald-700 bg-emerald-50"
        : overallScore >= 6 
            ? "border-amber-500 text-amber-700 bg-amber-50"
            : "border-rose-500 text-rose-700 bg-rose-50";

    const reportMetrics = reportData.report;

    return (
        <div className="bg-[#EEF2F7] font-sans text-[#111c2d] min-h-screen">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-[#f9f9ff]/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-1 text-[#3f484b] hover:text-[#0D5C6B] transition-colors text-sm font-medium cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            Back to Dashboard
                        </button>
                        <div className="h-6 w-[1px] bg-[#bfc8cb] mx-2"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0D5C6B] rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[20px]">forum</span>
                            </div>
                            <span className="text-xl font-bold text-[#0D5C6B] tracking-tight">Intervix</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-[#111c2d]">{reportData.fullName || "User"}</span>
                            <span className="text-xs text-[#3f484b]">Standard Plan</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-[#d8e3fb] overflow-hidden">
                            <img 
                                className="w-full h-full object-cover" 
                                alt="User Profile" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoG8KI4DP8ZHnBong-aoY4PR1-Hyz8c3iPoOyf4oDMxXsf49Ri8VbfFxzt4dhWCV0RSXQR7YK23uFDFjBlB1OtNyOmoXAC8MizHK7k79q7JOW0GijUkqwZUKwxsaXz7qw3g6C7ldSXtLsHyF64i2cALFyO7OLEQm17e-wtDxciJHwY39kcEEaWKPdV3FiNWwEzBXee4JHJGoFhoUEbyzbDgdXqdNbsKcA-mkIFSo-PsenpM5X1o0QmeeZhflmG3oFSIi3eZ_IgwhQ"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Shell */}
            <main className="pt-32 pb-16 px-6 max-w-4xl mx-auto space-y-6">
                
                {/* Session Header Card */}
                <section className="bg-white rounded-2xl p-6 border border-[#e7eeff] shadow-[0px_4px_20px_rgba(13,92,107,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <span className="inline-block px-2 py-1 bg-[#91d2e3]/10 text-[#004e5c] text-xs font-medium rounded-full tracking-wide uppercase">
                            COMPLETED SESSION REPORT
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d]">
                            Executive Presence Interview
                        </h1>
                        <div className="flex flex-wrap gap-4 items-center text-[#3f484b]">
                            <div className="flex items-center gap-1">
                                <span className="text-sm">Job Applied:</span>
                                <span className="text-sm text-[#0D5C6B] font-bold">{reportData.jobRole}</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#bfc8cb]"></div>
                            <div className="flex items-center gap-1 text-sm">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                Conducted on {new Date(reportData.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl border-4 shadow-lg flex flex-col items-center justify-center min-w-[140px] aspect-square ${scoreColor}`}>
                        <span className="text-xs uppercase tracking-widest mb-1 opacity-80">Overall</span>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-4xl font-black">{overallScore}</span>
                            <span className="text-xl opacity-60">/10</span>
                        </div>
                        <span className="text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-full bg-black/5">
                            {overallScore >= 8 ? "Excellent" : overallScore >= 6 ? "Competent" : "Needs Practice"}
                        </span>
                    </div>
                </section>

                {/* Metrics Row */}
                {reportMetrics && (
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border-t-4 border-[#0D5C6B] shadow-[0px_4px_20px_rgba(13,92,107,0.05)] hover:-translate-y-0.5 transition-transform duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs text-[#3f484b] tracking-widest uppercase">Technical</span>
                                <span className="text-xl font-bold text-[#0D5C6B]">{reportMetrics.technical?.score || 0}/10</span>
                            </div>
                            <p className="text-sm text-[#3f484b] leading-relaxed">{reportMetrics.technical?.feedback}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-t-4 border-[#0D5C6B] shadow-[0px_4px_20px_rgba(13,92,107,0.05)] hover:-translate-y-0.5 transition-transform duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs text-[#3f484b] tracking-widest uppercase">Communication</span>
                                <span className="text-xl font-bold text-[#0D5C6B]">{reportMetrics.communication?.score || 0}/10</span>
                            </div>
                            <p className="text-sm text-[#3f484b] leading-relaxed">{reportMetrics.communication?.feedback}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-t-4 border-[#0D5C6B] shadow-[0px_4px_20px_rgba(13,92,107,0.05)] hover:-translate-y-0.5 transition-transform duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs text-[#3f484b] tracking-widest uppercase">Confidence</span>
                                <span className="text-xl font-bold text-[#0D5C6B]">{reportMetrics.confidence?.score || 0}/10</span>
                            </div>
                            <p className="text-sm text-[#3f484b] leading-relaxed">{reportMetrics.confidence?.feedback}</p>
                        </div>
                    </section>
                )}

                {/* Recommendations and Strengths */}
                {reportMetrics && (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-[0px_4px_20px_rgba(13,92,107,0.05)]">
                            <h3 className="text-base font-bold mb-4 text-[#111c2d] flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">verified</span>
                                Key Strengths
                            </h3>
                            <ul className="space-y-3">
                                {reportMetrics.strengths?.map((str, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-[#3f484b]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                        {str}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-[0px_4px_20px_rgba(13,92,107,0.05)]">
                            <h3 className="text-base font-bold mb-4 text-[#111c2d] flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">trending_up</span>
                                Growth Areas
                            </h3>
                            <ul className="space-y-3">
                                {reportMetrics.improvements?.map((imp, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-[#3f484b]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                                        {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
{/* Q&A Accordion Section */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-[#111c2d] px-1 tracking-tight">
                        Question-by-Question Analysis
                    </h2>
                    <div className="space-y-3">
                        {reportData.answers?.length === 0 ? (
                            <div className="text-center py-10 bg-white border border-[#bfc8cb] rounded-3xl">
                                <p className="text-[#3f484b]">No questions answered in this session.</p>
                            </div>
                        ) : (
                            reportData.answers?.map((item, index) => {
                                const isExpanded = expandedIndex === index;
                                const itemScore = item.evaluation?.score || 0;
                                const itemScoreColor = itemScore >= 8 
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                    : itemScore >= 6
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-rose-100 text-rose-700 border-rose-200";

                                return (
                                    <div key={index} className="bg-white border border-[#bfc8cb] rounded-xl overflow-hidden shadow-sm">
                                        <button 
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-[#e7eeff]/40 transition-colors cursor-pointer"
                                            onClick={() => toggleAccordion(index)}
                                        >
                                            {/* Fixed Score Badge Wrapper */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 shrink-0">
                                                    <span className="text-xs text-[#0D5C6B] font-bold tracking-widest uppercase whitespace-nowrap">
                                                        QUESTION {index + 1}
                                                    </span>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border text-center whitespace-nowrap shrink-0 ${itemScoreColor}`}>
                                                        {itemScore} / 10
                                                    </div>
                                                </div>
                                                <span className="text-base font-semibold text-[#111c2d] leading-snug truncate pr-4">
                                                    "{item.question}"
                                                </span>
                                            </div>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ml-auto shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>
                                        
                                        <div className={`transition-all duration-300 ease-out overflow-hidden ${isExpanded ? 'max-h-[1000px] border-t border-[#bfc8cb]' : 'max-h-0'}`}>
                                            <div className="p-6 space-y-6 bg-[#f9f9ff]">
                                                <div>
                                                    <h4 className="text-xs text-[#3f484b] uppercase tracking-wider mb-2 font-bold">Your Answer</h4>
                                                    <div className="bg-[#e7eeff]/40 p-4 rounded-lg border-l-4 border-[#0D5C6B] italic text-sm text-[#3f484b] leading-relaxed">
                                                        "{item.answerText || "No answer recorded."}"
                                                    </div>
                                                </div>
                                                
                                                {item.evaluation && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-[#91d2e3]/5 p-4 rounded-lg border border-[#91d2e3]/10">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="material-symbols-outlined text-[#0D5C6B]">psychology</span>
                                                                <span className="text-sm text-[#0D5C6B] font-bold">AI Feedback</span>
                                                            </div>
                                                            <p className="text-sm text-[#3f484b]">{item.evaluation.feedback || "No feedback generated."}</p>
                                                        </div>
                                                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="material-symbols-outlined text-emerald-600">lightbulb</span>
                                                                <span className="text-sm text-emerald-600 font-bold">Improvement Tips</span>
                                                            </div>
                                                            <p className="text-sm text-[#3f484b]">{item.evaluation.improvement || "Keep up the good response style."}</p>
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
                </section>
            </main>
        </div>
    );
}