const Session = require('../models/Session');
const multer = require('multer');
const { uploadFile } = require('../services/mediaUploads');
const { DEFAULT_COUNT } = require('../services/geminiService');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

const createSession = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Please login first' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    try {
        const cvUrl = await uploadFile(req.file.buffer, req.file.originalname);

        const questionCount = parseInt(req.body.questionCount, 10) || DEFAULT_COUNT;

        const session = new Session({
            userEmail: user.email,
            fullName: req.body.fullName || user.fullName,
            cvFilePath: cvUrl,
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
            cvFilePath: cvUrl,
            questionCount: session.questionCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating session', error: error.message });
    }
};

const getMySessions = (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Please login' });
    }

    Session.find({ userEmail: user.email })
        .sort({ createdAt: -1 })
        .then((sessions) => res.json(sessions))
        .catch((error) => {
            res.status(500).json({ message: 'Error fetching sessions', error: error.message });
        });
};

const getSessionById = (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Please login' });
    }

    Session.findOne({ _id: req.params.id, userEmail: user.email })
        .then((session) => {
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            res.json(session);
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error fetching session', error: error.message });
        });
};

const getSessionReport = (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Please login' });
    }

    Session.findOne({ _id: req.params.id, userEmail: user.email })
        .then((session) => {
            if (!session) {
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
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error fetching session report', error: error.message });
        });
};

module.exports = { upload, createSession, getMySessions, getSessionById, getSessionReport };