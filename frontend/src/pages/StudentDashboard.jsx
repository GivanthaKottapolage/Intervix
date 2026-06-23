import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function StudentDashboard() {
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchSessions();
    }, []);

    async function fetchSessions() {
        try {
            const res = await axios.get(
                "/api/sessions/my",
                { headers: { Authorization: "Bearer " + token } }
            );
            setSessions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        Welcome to Intervix AI
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 active:scale-95 cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>

                <Link
                    to="/interview-form"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl mb-10 transition"
                >
                    🎯 Start New Interview Form
                </Link>

                <h2 className="text-2xl font-semibold mb-6">Your Previous Sessions</h2>

                {sessions.length === 0 ? (
                    <p className="text-gray-500">No previous sessions found. Start your first interview preparation!</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {sessions.map((session) => (
                            <div key={session._id} className="bg-white p-6 rounded-2xl shadow">
                                <p className="font-medium">{session.fullName}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                                <p className="mt-3">
                                    <span className="capitalize px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        {session.jobRole}
                                    </span>
                                </p>
                                <p className="mt-2 text-gray-600">{session.preferedIndustry}</p>
                                <p className="mt-2 text-gray-600">{session.university}</p>
                                <p className="mt-2 text-gray-600">{session.academicYear}</p>
                                <p className="mt-2 text-gray-600">{session.experienceLevel}</p>
                                <p className="mt-3">
                                    <span className="capitalize px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {session.status}
                                    </span>
                                </p>

                                {session.questions?.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        {session.questions.length} questions ready
                                    </p>
                                )}

                                <Link
                                    to={session.status === "completed" ? `/report/${session._id}` : `/interview/${session._id}`}
                                    className="mt-4 inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl"
                                >
                                    {session.status === "completed"
                                        ? "View Results"
                                        : session.questions?.length > 0
                                            ? "Start Interview"
                                            : "Prepare Interview"}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}