import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const STEPS = {
  LOADING: "loading",
  PREPARE: "prepare",
  READY: "ready",
  INTERVIEWING: "interviewing",
  FEEDBACK: "feedback",
  COMPLETE: "complete",
};

const STAGE_ORDER = ["prepare", "ready", "interviewing", "complete"];
const STAGE_LABELS = { prepare: "Setup", ready: "Ready", interviewing: "Interview", complete: "Done" };

function stageIndexFor(step) {
  if (step === STEPS.FEEDBACK) return STAGE_ORDER.indexOf("interviewing");
  const idx = STAGE_ORDER.indexOf(step);
  return idx === -1 ? 0 : idx;
}

// --- inline icons, consistent with the rest of the app ---
function BoltIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function ArrowLeftIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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
function StopIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
function VolumeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}
function CheckCircleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-5" />
    </svg>
  );
}
function AlertIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
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
function ChevronRightIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}
function Spinner({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StageTracker({ step }) {
  const activeIdx = stageIndexFor(step);
  return (
    <div className="flex items-center mb-7">
      {STAGE_ORDER.map((stage, i) => (
        <div key={stage} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < activeIdx
                  ? "bg-gradient-to-br from-[#00488d] to-[#006a61] text-white"
                  : i === activeIdx
                  ? "bg-[#00488d] text-white ring-4 ring-[#00488d]/15"
                  : "bg-[#e5eeff] text-[#727783]"
              }`}
            >
              {i < activeIdx ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium ${i <= activeIdx ? "text-[#00488d]" : "text-[#727783]"}`}>
              {STAGE_LABELS[stage]}
            </span>
          </div>
          {i < STAGE_ORDER.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 -mt-4 ${i < activeIdx ? "bg-[#00488d]" : "bg-[#e5eeff]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [session, setSession] = useState(null);
  const [step, setStep] = useState(STEPS.LOADING);
  const [questionCount, setQuestionCount] = useState(15);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const fetchedRef = useRef(false);

  const authHeaders = { Authorization: "Bearer " + token };

  const loadSession = useCallback(async () => {
    const res = await axios.get(`/api/sessions/${id}`, { headers: authHeaders });
    setSession(res.data);
    setCurrentIndex(res.data.currentQuestionIndex || 0);
    setQuestionCount(Math.max(Number(res.data.questionCount) || 15, 15));

    if (res.data.status === "completed") {
      setStep(STEPS.COMPLETE);
    } else if (res.data.questions?.length > 0) {
      setStep(res.data.status === "in-progress" ? STEPS.INTERVIEWING : STEPS.READY);
    } else {
      setStep(STEPS.PREPARE);
    }
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadSession().catch(() => {
      toast.error("Could not load session");
      navigate("/dashboard");
    });
  }, [token, navigate, loadSession]);

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
    setSession((prev) => (prev ? { ...prev, processingError: null } : prev));
    try {
      const res = await axios.post(
        "/api/ai/prepare",
        { sessionId: id, questionCount: Math.max(Number(questionCount), 15) },
        { headers: authHeaders }
      );
      toast.success(`${res.data.questionCount} questions generated!`);
      await loadSession();
      setStep(STEPS.READY);
    } catch (err) {
      toast.error(err.response?.data?.error || "Preparation failed");
      await loadSession();
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
      <div className="min-h-screen bg-[#eef2fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-7 h-7 text-[#00488d]" />
          <p className="text-[#424752] text-sm">Loading your interview…</p>
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
