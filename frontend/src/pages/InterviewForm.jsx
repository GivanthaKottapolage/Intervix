import { useCallback, useEffect, useRef, useState } from "react";
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
        const audio = new Audio(url);
        audioRef.current = audio;
        await audio.play();
        audio.onended = () => {
          setPlayingAudio(false);
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        setPlayingAudio(false);
        toast.error(err.response?.data?.error || "Could not play question audio");
      }
    },
    [id, token]
  );

  async function handlePrepare() {
    setBusy(true);
    try {
      const res = await axios.post(
        "/api/ai/prepare",
        { sessionId: id, questionCount: Number(questionCount) },
        { headers: authHeaders }
      );
      toast.success(`${res.data.questionCount} questions generated!`);
      await loadSession();
      setStep(STEPS.READY);
    } catch (err) {
      toast.error(err.response?.data?.error || "Preparation failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartInterview() {
    setBusy(true);
    try {
      await axios.post("/api/ai/start", { sessionId: id }, { headers: authHeaders });
      await loadSession();
      setCurrentIndex(0);
      setStep(STEPS.INTERVIEWING);
      await playQuestionTts(0);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not start interview");
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await submitAnswer(blob);
      };

      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function submitAnswer(audioBlob) {
    setBusy(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "answer.webm");
    formData.append("sessionId", id);

    try {
      const res = await axios.post("/api/ai/submit-answer", formData, {
        headers: authHeaders,
      });

      setLastAnswer(res.data.answerText);
      setLastEvaluation(res.data.evaluation);
      setStep(STEPS.FEEDBACK);

      if (res.data.isComplete) {
        toast.success("Interview completed!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to process answer");
    } finally {
      setBusy(false);
    }
  }

  async function handleNextQuestion() {
    setBusy(true);
    try {
      const fresh = await axios.get(`/api/sessions/${id}`, { headers: authHeaders });
      setSession(fresh.data);

      if (fresh.data.status === "completed") {
        setStep(STEPS.COMPLETE);
        return;
      }

      const nextIndex = fresh.data.currentQuestionIndex;
      setCurrentIndex(nextIndex);
      setLastEvaluation(null);
      setLastAnswer("");
      setStep(STEPS.INTERVIEWING);
      await playQuestionTts(nextIndex);
    } catch {
      toast.error("Could not load next question");
    } finally {
      setBusy(false);
    }
  }

  if (step === STEPS.LOADING || !session) {
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
          )}

          {/* PREPARE */}
          {step === STEPS.PREPARE && (
            <div className="flex flex-col gap-5">
              <p className="text-[#424752]">Prepare your AI interview from your uploaded CV.</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Number of questions</label>
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
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full accent-[#00488d]"
                  />
                </div>
              </div>

              {session.processingError && (
                <p className="text-sm text-[#ba1a1a] bg-red-50 p-3 rounded-lg">{session.processingError}</p>
              )}

              <button
                onClick={handlePrepare}
                disabled={busy}
                className="w-full bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,72,141,0.3)] disabled:opacity-60"
              >
                {busy && <Spinner className="w-4 h-4" />}
                {busy ? "Generating questions…" : "Prepare Interview"}
              </button>
            </div>
          )}

          {/* READY */}
          {step === STEPS.READY && (
            <div className="flex flex-col items-center text-center gap-5 py-2">
              <div className="w-14 h-14 rounded-full bg-[#86f2e4]/60 flex items-center justify-center">
                <CheckCircleIcon className="w-7 h-7 text-[#006a61]" />
              </div>
              <p className="text-[#006a61] font-semibold">{total} questions ready</p>
              <button
                onClick={handleStartInterview}
                disabled={busy}
                className="w-full bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,72,141,0.3)] disabled:opacity-60"
              >
                {busy && <Spinner className="w-4 h-4" />}
                {busy ? "Starting…" : "Start Interview"}
              </button>
            </div>
          )}

          {/* INTERVIEWING */}
          {step === STEPS.INTERVIEWING && currentQuestion && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#eff4ff] rounded-xl p-6 border border-[#c2c6d4]/30">
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
                {playingAudio && (
                  <p className="text-sm text-[#00488d] mt-3 flex items-center gap-1.5">
                    <VolumeIcon className="w-4 h-4 animate-pulse" />
                    AI is asking the question…
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-[#c2c6d4] rounded-xl p-8 flex flex-col items-center gap-4 text-center">
                <p className="text-[#424752] text-sm">Record your answer after the question plays</p>

                {!recording ? (
                  <button
                    onClick={startRecording}
                    disabled={busy || playingAudio}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00488d] to-[#006a61] text-white flex items-center justify-center shadow-lg shadow-[#00488d]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <MicIcon className="w-7 h-7" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-lg shadow-[#ba1a1a]/30 animate-pulse"
                  >
                    <StopIcon className="w-6 h-6" />
                  </button>
                )}
                <span className="text-sm font-medium text-[#424752]">
                  {recording ? "Tap to stop & submit" : "Tap to start recording"}
                </span>

                {busy && (
                  <p className="text-sm text-[#424752] flex items-center gap-2 mt-1">
                    <Spinner className="w-4 h-4 text-[#00488d]" />
                    Processing with Whisper + Gemini…
                  </p>
                )}
              </div>

              <button
                onClick={() => playQuestionTts(currentIndex)}
                disabled={playingAudio}
                className="text-sm font-medium text-[#00488d] hover:underline disabled:opacity-50 self-center"
              >
                Replay question audio
              </button>
            </div>
          )}

          {/* FEEDBACK */}
          {step === STEPS.FEEDBACK && lastEvaluation && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#eff4ff] rounded-xl p-4 border border-[#c2c6d4]/30">
                <p className="text-xs font-bold uppercase tracking-widest text-[#424752] mb-1">Your answer</p>
                <p className="text-sm">{lastAnswer}</p>
              </div>

              <div className="bg-white border border-[#c2c6d4]/30 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {lastEvaluation.correct ? (
                      <CheckCircleIcon className="w-5 h-5 text-[#006a61]" />
                    ) : (
                      <AlertIcon className="w-5 h-5 text-[#9a6700]" />
                    )}
                    <span className="font-semibold">
                      {lastEvaluation.correct ? "Good answer" : "Needs improvement"}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[#00488d]">{lastEvaluation.score}/10</span>
                </div>
                <div className="w-full h-1.5 bg-[#d3e4fe] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#00488d] to-[#006a61]"
                    style={{ width: `${Math.min(lastEvaluation.score, 10) * 10}%` }}
                  />
                </div>
                <p className="text-sm text-[#424752] leading-relaxed">{lastEvaluation.feedback}</p>
                {lastEvaluation.improvement && (
                  <div className="flex items-start gap-2 mt-3 bg-[#eff4ff] rounded-lg p-3">
                    <SparkleIcon className="w-4 h-4 text-[#00488d] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#424752]">
                      <strong className="text-[#0b1c30]">Tip: </strong>
                      {lastEvaluation.improvement}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={busy}
                className="w-full bg-gradient-to-br from-[#00488d] to-[#006a61] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,72,141,0.3)] disabled:opacity-60"
              >
                {busy && <Spinner className="w-4 h-4" />}
                {session.status === "completed" ? "Finish Interview" : "Next Question"}
                {!busy && <ChevronRightIcon className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* COMPLETE */}
          {step === STEPS.COMPLETE && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00488d] to-[#006a61] flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-xl font-bold">Interview completed!</p>
              <p className="text-[#424752]">All answers and feedback have been saved to your session.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-2 inline-flex items-center gap-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00488d] font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}