const Session = require('../models/Session');
const multer = require('multer');
const fs = require('fs');
const { DEFAULT_COUNT } = require('../services/geminiService');

const cvDir = 'uploads/cvs/';
if (!fs.existsSync(cvDir)) {
    fs.mkdirSync(cvDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, cvDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

const createSession = (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Please login first' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    const questionCount = parseInt(req.body.questionCount, 10) || DEFAULT_COUNT;

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

    session.save()
        .then(() => {
            res.json({
                message: 'CV uploaded and session created successfully',
                sessionId: session._id,
                cvFilePath: req.file.path,
                questionCount: session.questionCount
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error creating session', error: error.message });
        });
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

module.exports = { upload, createSession, getMySessions, getSessionById };
