import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function InterviewForm() {
    const [fullName, setFullName] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!fullName || !cvFile) {
            toast.error("Please fill all fields and upload your CV");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("cv", cvFile);

        try {
            await axios.post(
                "/api/sessions/",
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("CV uploaded successfully! Session created.");
            navigate("/dashboard");   // Go back to dashboard after success
        } catch (err) {
            toast.error("Failed to upload CV. Please try again.");
            console.log(err);
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
    );
}