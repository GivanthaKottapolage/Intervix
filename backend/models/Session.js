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
    jobRole: {
        type: String,
        required: true
    },
    preferedIndustry: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    areasToFocus: {
        type: [String],
        default: []
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