const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    fullName: { type: String, required: true },
    cvFilePath: { type: String, required: true },
    jobRole: { type: String, required: true },
    preferedIndustry: { type: String, required: true },
    university: { type: String, required: true },
    academicYear: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    areasToFocus: { type: [String], default: [] },

    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'ready', 'in-progress', 'completed']
    },

    questionCount: { type: Number, default: 5 },

    cvData: { type: Object, default: null },
    cvFileName: { type: String, default: null },

    // Generated upfront by Gemini (Feature 1)
    questions: [{
        id: Number,
        question: String,
        category: String,
        difficulty: String
    }],

    // User answers + AI evaluation per question (Features 5–8)
    answers: [{
        questionIndex: Number,
        questionId: Number,
        question: String,
        answerText: String,
        evaluation: {
            correct: Boolean,
            score: Number,
            feedback: String,
            improvement: String
        },
        answeredAt: { type: Date, default: Date.now }
    }],

    currentQuestionIndex: { type: Number, default: 0 },
    processingError: { type: String, default: null },

    messages: [{
        role: { type: String, enum: ['interviewer', 'candidate'] },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],

    report: { type: Object, default: null },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
