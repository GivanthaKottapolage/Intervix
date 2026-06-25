const Session = require('../models/Session');
const multer = require('multer');
const { uploadFile } = require('../services/mediaUploads');
const { DEFAULT_COUNT } = require('../services/geminiService');

const canAccessSession = (user, session) =>
    session && (session.userEmail === user.email || user.role === 'admin');

const mapSessionStatus = (status, answersCount = 0) => {
    if (status === 'completed') return 'completed';
    if (status === 'in-progress' || answersCount > 0) return 'in_progress';
    return 'pending';
};

const formatSessionRow = (session) => ({
    id: session._id,
    studentName: session.fullName,
    jobRole: session.jobRole,
    industry: session.preferedIndustry,
    experience: session.experienceLevel,
    status: mapSessionStatus(session.status, session.answers?.length || 0),
    questions: session.questions?.length || session.questionCount || 0,
    date: session.createdAt
});

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

const createSession = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file.' });
        }

        const questionCount = Math.max(parseInt(req.body.questionCount, 10) || DEFAULT_COUNT, 15);

        const session = new Session({
            userEmail: user.email,
            fullName: req.body.fullName || user.fullName,
            cvFilePath: req.file.path,
            cvFileName: req.file.originalname,
            jobRole: req.body.jobRole,
            preferedIndustry: req.body.preferedIndustry,
            university: req.body.university,
            academicYear: req.body.academicYear,
            experienceLevel: req.body.experienceLevel,
            areasToFocus: JSON.parse(req.body.areasToFocus || '[]'),
            questionCount
        });

        await session.save();

        res.json({
            message: 'CV uploaded and session created successfully',
            sessionId: session._id,
            cvFilePath: req.file.path,
            questionCount: session.questionCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating session', error: error.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 });
        res.json(sessions.map(formatSessionRow));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

const getMySessions = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please login' });
        }

        const sessions = await Session.find({ userEmail: user.email }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

const getSessionById = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please login' });
        }

        const session = await Session.findOne({ _id: req.params.id });

        if (!canAccessSession(user, session)) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session', error: error.message });
    }
};

const getSessionReport = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please login' });
        }

        const session = await Session.findOne({ _id: req.params.id });

        if (!canAccessSession(user, session)) {
            return res.status(404).json({ message: 'Session not found' });
        }

        let overallScore = 0;
        if (session.report && typeof session.report.overall_score === 'number') {
            overallScore = session.report.overall_score;
        } else if (session.answers && session.answers.length > 0) {
            const sum = session.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
            overallScore = Number((sum / session.answers.length).toFixed(1));
        }

        res.json({
            _id: session._id,
            fullName: session.fullName,
            jobRole: session.jobRole,
            status: session.status,
            createdAt: session.createdAt,
            report: session.report,
            overallScore: overallScore,
            answers: session.answers || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching session report', error: error.message });
    }
};

module.exports = { upload, createSession, getAllSessions, getMySessions, getSessionById, getSessionReport };