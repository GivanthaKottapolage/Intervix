const mongoose = require('mongoose'); // ← changed from import

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
        default: 'pending',
        enum: ['pending', 'in-progress', 'completed']
    },

    // ── YOUR NEW FIELDS ──────────────────────
    cvData: {
        type: Object,    // structured JSON from Gemini
        default: null
    },
    cvFileName: {
        type: String,
        default: null
    },
    messages: [{      // stores full interview transcript
        role: {
            type: String,
            enum: ['interviewer', 'candidate']
        },
        text: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    report: {         // stores feedback report
        type: Object,
        default: null
    },
    // ─────────────────────────────────────────

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session; // ← changed from export default