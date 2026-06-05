import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    cvFilePath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending", // pending, in-progress, completed
        enum: ["pending", "in-progress", "completed"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;