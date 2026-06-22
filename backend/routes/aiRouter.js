const express = require('express');
const multer = require('multer');
const fs = require('fs');
const interviewController = require('../controllers/interviewController');
const { uploadCV } = require('../controllers/cvController');

const router = express.Router();

const audioUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const cvUpload = multer({
    dest: 'uploads/cvs/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files allowed'));
    }
});

// Interview pipeline
router.post('/ai/prepare', interviewController.prepareInterview);
router.post('/ai/start', interviewController.startInterview);
router.post('/ai/tts', interviewController.speakQuestion);
router.post('/ai/submit-answer', audioUpload.single('audio'), interviewController.submitAnswer);
router.get('/ai/session/:sessionId', interviewController.getInterviewSession);
router.post('/ai/generate-report', interviewController.generateReport);

// CV upload (existing)
router.post('/cv/upload', cvUpload.single('cv'), uploadCV);

module.exports = router;
