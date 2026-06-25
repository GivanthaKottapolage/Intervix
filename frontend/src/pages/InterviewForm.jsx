import { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function InterviewForm() {
    const [fullName, setFullName] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [jobRole, setJobRole] = useState("");
    const [preferedIndustry, setPreferedIndustry] = useState("");
    const [university, setUniversity] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [areasToFocus, setAreasToFocus] = useState([]);
    const [questionCount, setQuestionCount] = useState(15);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!fullName || !cvFile || !jobRole || !preferedIndustry || !university || !academicYear || !experienceLevel || areasToFocus.length === 0) {
            toast.error("Please fill all fields and upload your CV");
            return;
        }

  const playQuestionTts = useCallback(
    async (index) => {
      setPlayingAudio(true);
      try {
        const res = await axios.post(
          "/api/ai/tts",
          { sessionId: id, questionIndex: index },
          { headers: authHeaders, responseType: "blob" }
        );
        const url = URL.createObjectURL(res.data);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setAreaInput("");
    }

    function removeArea(index) {
        setAreasToFocus((prev) => prev.filter((_, i) => i !== index));
    }

    function handleAreaKeyDown(e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addArea(areaInput);
        }
    }

    function clearFile() {
        setCvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (
            !fullName ||
            !cvFile ||
            !jobRole ||
            !preferedIndustry ||
            !university ||
            !academicYear ||
            !experienceLevel ||
            areasToFocus.length === 0
        ) {
            toast.error("Please fill all fields and upload your CV");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("cv", cvFile);
        formData.append("jobRole", jobRole);
        formData.append("preferedIndustry", preferedIndustry);
        formData.append("university", university);
        formData.append("academicYear", academicYear);
        formData.append("experienceLevel", experienceLevel);
        formData.append("areasToFocus", JSON.stringify(areasToFocus));
        formData.append("questionCount", String(questionCount));

        try {
            await axios.post("/api/sessions/", formData, {
                headers: { Authorization: "Bearer " + token },
            });
            toast.success("CV uploaded successfully! Session created.");
            navigate("/dashboard");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to upload CV. Please try again.";
            toast.error(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center mb-8">Interview Preparation Form</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Upload CV (PDF only)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setCvFile(e.target.files[0])}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Job Role</label>
                        <input
                            type="text"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the job role you're applying for"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Preferred Industry</label>
                        <input
                            type="text"
                            value={preferedIndustry}
                            onChange={(e) => setPreferedIndustry(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your preferred industry"
                            required
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-medium mb-2">University / Institution</label>
                        <input
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your university or institution"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Current Academic Year / Degree</label>
                        <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your current academic year or degree"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Experience Level</label>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select your experience level</option>
                            <option value="Internship">Internship</option>
                            <option value="Entry Level">Entry Level</option>
                            <option value="Mid Level">Mid Level</option>
                            <option value="Senior Level">Senior Level</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Areas to Focus On</label>
                        <input
                            type="text"
                            value={areasToFocus}
                            onChange={(e) => setAreasToFocus(e.target.value.split(",").map(item => item.trim()))}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter areas you want to focus on (comma separated)"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Number of Interview Questions</label>
                        <input
                            type="number"
                            min={15}
                            max={15}
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Math.max(Number(e.target.value), 15))}
                            className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl text-lg transition"
                    >
                        {loading ? "Uploading..." : "Submit & Start Preparation"}
                    </button>
                </form>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full mt-4 text-gray-600 hover:text-gray-800 py-3"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
      </div>
    );
  }

  const questions = session.questions || [];
  const total = questions.length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="relative min-h-screen bg-[#eef2fb] text-[#0b1c30]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#00488d]/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#006a61]/8 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#00488d] to-[#006a61] rounded-lg flex items-center justify-center">
              <BoltIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold">Intervix</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm font-medium text-[#424752] hover:text-[#00488d] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-2xl shadow-xl p-6 md:p-9">
          <StageTracker step={step} />

          <h1 className="text-2xl font-bold mb-1">Mock Interview</h1>
          <p className="text-[#424752] mb-6">
            {session.fullName} · {session.jobRole}
          </p>

          {total > 0 && step !== STEPS.PREPARE && (
            <div className="mb-6">
              <div className="flex gap-1.5 mb-2">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < currentIndex ? "bg-[#006a61]" : i === currentIndex ? "bg-[#00488d]" : "bg-[#d3e4fe]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-[#00488d]">
                Question {Math.min(currentIndex + 1, total)} / {total}
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#00488d] to-[#006a61] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">IX</span>
                        </div>
                        <span className="text-lg font-bold">Intervix</span>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#424752] hover:text-[#00488d] transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-2xl shadow-xl p-6 md:p-9">
                    <div className="mb-7">
                        <h1 className="text-2xl md:text-[28px] font-bold mb-1">
                            Interview Preparation Form
                        </h1>
                        <p className="text-sm text-[#424752]">
                            Tell us about the role you're targeting and we'll generate tailored mock interview questions from your CV.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                        {/* Your Profile */}
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#727783]">
                                Your Profile
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className={fieldClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">University / Institution</label>
                                    <input
                                        type="text"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="Enter your university or institution"
                                        className={fieldClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Academic Year / Degree</label>
                                    <input
                                        type="text"
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        placeholder="e.g. 3rd Year, BSc IT"
                                        className={fieldClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                                    <select
                                        value={experienceLevel}
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className={fieldClass}
                                        required
                                    >
                                        <option value="">Select your experience level</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Mid Level">Mid Level</option>
                                        <option value="Senior Level">Senior Level</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Target Role */}
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#727783]">
                                Target Role
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Job Role</label>
                                    <input
                                        type="text"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        placeholder="e.g. Frontend Developer"
                                        className={fieldClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Industry</label>
                                    <input
                                        type="text"
                                        value={preferedIndustry}
                                        onChange={(e) => setPreferedIndustry(e.target.value)}
                                        placeholder="e.g. FinTech, Healthcare"
                                        className={fieldClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CV Upload */}
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#727783]">
                                Your CV
                            </p>
                            <div>
                                <label className="block text-sm font-medium mb-2">Upload CV (PDF only)</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setCvFile(e.target.files[0] || null)}
                                    className="hidden"
                                    required={!cvFile}
                                />
                                {cvFile ? (
                                    <div className="flex items-center justify-between gap-3 bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[#006a61]">✓</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{cvFile.name}</p>
                                                <p className="text-xs text-[#424752]">{formatBytes(cvFile.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#424752] hover:bg-white hover:text-red-500 transition-colors shrink-0"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-[#c2c6d4] rounded-lg px-4 py-6 flex flex-col items-center justify-center gap-2 text-[#424752] hover:border-[#00488d] hover:bg-[#eff4ff] hover:text-[#00488d] transition-all"
                                    >
                                        <span className="text-2xl">↑</span>
                                        <span className="text-sm font-medium">Click to upload your CV</span>
                                        <span className="text-xs">PDF only</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Interview Setup */}
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#727783]">
                                Interview Setup
                            </p>

                            <div>
                                <label className="block text-sm font-medium mb-2">Areas to Focus On</label>
                                <div
                                    onClick={() => document.getElementById("area-input")?.focus()}
                                    className="w-full bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-[#005db5]/20 focus-within:border-[#00488d] focus-within:bg-white transition-all"
                                >
                                    {areasToFocus.map((area, i) => (
                                        <span
                                            key={area + i}
                                            className="flex items-center gap-1.5 bg-[#dce9ff] text-[#00488d] text-sm font-medium px-3 py-1 rounded-full"
                                        >
                                            {area}
                                            <button
                                                type="button"
                                                onClick={() => removeArea(i)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        id="area-input"
                                        type="text"
                                        value={areaInput}
                                        onChange={(e) => setAreaInput(e.target.value)}
                                        onKeyDown={handleAreaKeyDown}
                                        onBlur={() => areaInput && addArea(areaInput)}
                                        placeholder={
                                            areasToFocus.length === 0
                                                ? "Type a focus area and press Enter (e.g. System Design)"
                                                : "Add another…"
                                        }
                                        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-[#727783] py-1"
                                    />
                                </div>
                                <p className="text-xs text-[#727783] mt-1">
                                    Press Enter or comma after each area to add it as a tag.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Number of Interview Questions
                                </label>
                                <div className="bg-[#eff4ff] border border-[#c2c6d4]/50 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-[#424752]">3</span>
                                        <span className="text-lg font-bold text-[#00488d]">{questionCount}</span>
                                        <span className="text-xs text-[#424752]">15</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={3}
                                        max={15}
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        className="w-full accent-[#00488d]"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,72,141,0.3)] disabled:opacity-60"
                        >
                            {loading ? "Uploading…" : "Submit & Start Preparation"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}