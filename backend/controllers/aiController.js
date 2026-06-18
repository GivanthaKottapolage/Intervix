const { transcribeAudio } = require('../services/whisperService');
const { getInterviewerResponse, generateFeedbackReport } = require('../services/geminiService');
const { convertToSpeech } = require('../services/ttsService');
const { extractCVText } = require('../services/cvService');
const Session = require('../models/Session');

// ─── START INTERVIEW ────────────────────────────────────────────
// Called when user clicks "Start Interview" on dashboard
const startInterview = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // get session from MongoDB
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        console.log('📂 CV path:', session.cvFilePath);

        // extract and structure CV using pdf-parse + Gemini
        const cvData = await extractCVText(session.cvFilePath);

        // save structured CV + update status
        session.cvData = cvData;
        session.status = 'in-progress';
        session.messages = []; // reset messages for fresh interview
        await session.save();

        console.log('✅ Interview started for:', session.fullName);

        res.json({
            message: 'Interview started successfully',
            sessionId: session._id,
            candidateName: session.fullName,
            jobRole: session.jobRole,
            cvData
        });

    } catch (err) {
        console.error('❌ Start interview error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ─── PROCESS ANSWER ─────────────────────────────────────────────
// Called every time user sends a voice answer during interview
const processAnswer = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file received' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // 1. Transcribe audio with Whisper
        const userText = await transcribeAudio(audioFile);
        console.log('🎤 User said:', userText);

        // 2. Get session from MongoDB
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // 3. Add user answer to messages
        session.messages.push({
            role: 'candidate',
            text: userText,
            timestamp: new Date()
        });

        // 4. Get Gemini's next question
        // uses jobRole ← fixed from session.role
        // uses cvData ← fixed from session.cvText
        const aiText = await getInterviewerResponse(
            session.messages,
            session.jobRole,        // ← fixed
            session.messages.length,
            session.cvData          // ← fixed
        );
        console.log('🤖 AI says:', aiText);

        // 5. Add AI response to messages
        session.messages.push({
            role: 'interviewer',
            text: aiText,
            timestamp: new Date()
        });
        await session.save();

        // 6. Convert AI text to speech with Gemini TTS
        const audioBuffer = await convertToSpeech(aiText);

        // 7. Send audio back to frontend
        res.set('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);

    } catch (err) {
        console.error('❌ Process answer error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ─── GENERATE REPORT ────────────────────────────────────────────
// Called when user clicks "Generate Report" button
const generateReport = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // check interview has messages
        if (!session.messages || session.messages.length === 0) {
            return res.status(400).json({ error: 'No interview messages found' });
        }

        // build full transcript string
        const fullTranscript = session.messages
            .map(m => `${m.role}: ${m.text}`)
            .join('\n');

        console.log('📝 Generating report for:', session.fullName);

        // send to Gemini for coaching report
        const report = await generateFeedbackReport(
            fullTranscript,
            session.jobRole,   // ← fixed from session.role
            session.cvData     // ← fixed from session.cvText
        );

        // save report + mark completed
        session.report = report;
        session.status = 'completed';
        await session.save();

        console.log('✅ Report generated for session:', sessionId);

        res.json({ report });

    } catch (err) {
        console.error('❌ Generate report error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { startInterview, processAnswer, generateReport };