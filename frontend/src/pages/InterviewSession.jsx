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

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current = null;
            }
        };
    }, [token, navigate, loadSession]);

    const playQuestionTts = useCallback(async (index) => {
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
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
            }
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => {
                setPlayingAudio(false);
                URL.revokeObjectURL(url);
                audioRef.current = null;
            };
            audio.onerror = () => {
                setPlayingAudio(false);
                URL.revokeObjectURL(url);
                audioRef.current = null;
                toast.error("Audio playback failed");
            };
            await audio.play();
        } catch (err) {
            setPlayingAudio(false);
            toast.error(err.response?.data?.error || "Could not play question audio");
        }
    }, [id, token]);

    async function handlePrepare() {
        setBusy(true);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Loading interview...</p>
            </div>
        );
    }

    const questions = session.questions || [];
    const total = questions.length;
    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate("/dashboard")} className="text-gray-600 mb-6 hover:text-gray-800">
                    ← Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Mock Interview</h1>
                    <p className="text-gray-500 mb-6">{session.fullName} · {session.jobRole}</p>

                    {total > 0 && step !== STEPS.PREPARE && (
                        <p className="text-sm font-medium text-blue-600 mb-4">
                            Question {Math.min(currentIndex + 1, total)} / {total}
                        </p>
                    )}

                    {/* PREPARE */}
                    {step === STEPS.PREPARE && (
                        <div className="space-y-4">
                            <p className="text-gray-600">Prepare your AI interview from your uploaded CV.</p>
                            <div>
                                <label className="block text-sm font-medium mb-2">Number of questions</label>
                                <input
                                    type="number"
                                    min={15}
                                    max={50}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Math.max(Number(e.target.value), 15))}
                                    className="w-full border rounded-2xl px-4 py-3"
                                />
                            </div>
                            {session.processingError && (
                                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{session.processingError}</p>
                            )}
                            <button
                                onClick={handlePrepare}
                                disabled={busy}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold"
                            >
                                {busy ? "Generating questions..." : "Prepare Interview"}
                            </button>
                        </div>
                    )}

                    {/* READY */}
                    {step === STEPS.READY && (
                        <div className="text-center space-y-4">
                            <p className="text-green-700 font-medium">{total} questions ready</p>
                            <button
                                onClick={handleStartInterview}
                                disabled={busy}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold text-lg"
                            >
                                {busy ? "Starting..." : "Start Interview"}
                            </button>
                        </div>
                    )}

                    {/* INTERVIEWING */}
                    {step === STEPS.INTERVIEWING && currentQuestion && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <p className="text-lg font-medium text-gray-800">{currentQuestion.question}</p>
                                {playingAudio && (
                                    <p className="text-sm text-indigo-600 mt-2">🔊 AI is asking the question...</p>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                                <p className="text-gray-600 mb-4">Record your answer after the question plays</p>
                                {!recording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={busy || playingAudio}
                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-2xl font-semibold"
                                    >
                                        🎤 Start Recording
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-semibold animate-pulse"
                                    >
                                        ⏹ Stop & Submit Answer
                                    </button>
                                )}
                                {busy && <p className="text-sm text-gray-500 mt-3">Processing with Whisper + Gemini...</p>}
                            </div>

                            <button
                                onClick={() => playQuestionTts(currentIndex)}
                                disabled={playingAudio}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                Replay question audio
                            </button>
                        </div>
                    )}

                    {/* FEEDBACK — must complete before next question (Feature 7) */}
                    {step === STEPS.FEEDBACK && lastEvaluation && (
                        <div className="space-y-4">
                            <div className="bg-green-50 rounded-2xl p-4">
                                <p className="text-sm text-green-800 font-medium">Your answer:</p>
                                <p className="text-gray-700 mt-1">{lastAnswer}</p>
                            </div>
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <p className="font-semibold text-blue-800">
                                    Score: {lastEvaluation.score}/10
                                    {lastEvaluation.correct ? " ✓ Good" : " — Needs improvement"}
                                </p>
                                <p className="text-gray-700 mt-2">{lastEvaluation.feedback}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Tip:</strong> {lastEvaluation.improvement}
                                </p>
                            </div>
                            <button
                                onClick={handleNextQuestion}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold"
                            >
                                {session.status === "completed" ? "Finish Interview" : "Next Question →"}
                            </button>
                        </div>
                    )}

                    {/* COMPLETE */}
                    {step === STEPS.COMPLETE && (
                        <div className="text-center space-y-4">
                            <p className="text-green-700 font-semibold text-lg">Interview completed!</p>
                            <p className="text-gray-600">All answers and feedback saved to your session.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
