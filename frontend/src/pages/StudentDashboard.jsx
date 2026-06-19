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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">
                    Welcome to Intervix AI
                </h1>

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
                                    to={`/interview/${session._id}`}
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