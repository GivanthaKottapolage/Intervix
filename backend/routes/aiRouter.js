const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { uploadCV } = require('../controllers/cvController');
const multer = require('multer');

// multer for audio files
const audioUpload = multer({
    dest: 'uploads/audio/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// multer for CV files
const cvUpload = multer({
    dest: 'uploads/cvs/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files allowed'));
        }
    }
});

// ── AI routes ──────────────────────────────────────────
router.post('/ai/start-interview', aiController.startInterview);                        // ← new
router.post('/ai/process-answer', audioUpload.single('audio'), aiController.processAnswer);
router.post('/ai/generate-report', aiController.generateReport);
router.post('/cv/upload', cvUpload.single('cv'), uploadCV);

module.exports = router;