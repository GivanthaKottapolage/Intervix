const { extractCVText } = require('../services/cvService');
const Session = require('../models/Session');
const fs = require('fs');

const uploadCV = async (req, res) => {
    try {
        const file = req.file;
        const { sessionId } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        console.log('📁 File received:', file.originalname);

        // extract + structure CV using pdf-parse + Gemini
        const cvData = await extractCVText(file.path);

        // save to session in MongoDB
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        session.cvData = cvData;
        session.cvFileName = file.originalname;
        session.status = 'in-progress'; // ← update status
        await session.save();

        // delete temp PDF file
        fs.unlinkSync(file.path);
        console.log('✅ CV saved to session:', sessionId);

        res.json({
            message: 'CV uploaded successfully',
            cvData
        });

    } catch (err) {
        console.error('❌ CV upload error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadCV };