const Session = require('../models/Session');
const {
    prepareSession,
    getQuestionAudio,
    processUserAnswer,
    DEFAULT_COUNT
} = require('../services/interviewFlowService');
const { generateFeedbackReport } = require('../services/geminiService');

const formatError = (err) => {
    console.error(err);
    return err?.message || 'Unknown error';
};

/**
 * POST /api/ai/prepare
 * Body: { sessionId, questionCount? }
 * Extract CV + generate questions + save to MongoDB
 */
const prepareInterview = async (req, res) => {
    try {
        const { sessionId, questionCount } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.questions?.length > 0) {
            console.log('[Interview] Reusing existing questions for session', sessionId);
            return res.json({
                message: 'Questions already generated',
                sessionId: session._id,
                questions: session.questions,
                questionCount: session.questions.length,
                status: session.status
            });
        }

        const count = parseInt(questionCount, 10) || session.questionCount || DEFAULT_COUNT;
        session.questionCount = count;
        session.processingError = null;
        await session.save();

        const { cvData, questions } = await prepareSession(session, count);

        session.cvData = cvData;
        session.questions = questions;
        session.status = 'ready';
        session.processingError = null;
        session.currentQuestionIndex = 0;
        await session.save();

        res.json({
            message: 'Interview prepared successfully',
            sessionId: session._id,
            questions,
            questionCount: questions.length,
            status: session.status
        });
    } catch (err) {
        console.error('[Interview] Prepare error:', err.message);
        if (req.body?.sessionId) {
            await Session.findByIdAndUpdate(req.body.sessionId, {
                processingError: formatError(err)
            });
        }
        res.status(500).json({ error: formatError(err) });
    }
};

/**
 * POST /api/ai/start
 * Body: { sessionId }
 */
const startInterview = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (!session.questions || session.questions.length === 0) {
            return res.status(400).json({
                error: 'No questions found. Call /api/ai/prepare first.'
            });
        }

        session.status = 'in-progress';
        session.currentQuestionIndex = 0;
        session.answers = [];
        await session.save();

        const currentQuestion = session.questions[0];

        console.log('[Interview] Started for', session.fullName);

        res.json({
            message: 'Interview started',
            sessionId: session._id,
            currentQuestionIndex: 0,
            totalQuestions: session.questions.length,
            currentQuestion
        });
    } catch (err) {
        console.error('[Interview] Start error:', err.message);
        res.status(500).json({ error: formatError(err) });
    }
};

/**
 * POST /api/ai/tts
 * Body: { sessionId, questionIndex? }
 * Returns MP3 audio for the question (Feature 3)
 */
const speakQuestion = async (req, res) => {
    try {
        const { sessionId, questionIndex } = req.body;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const index = questionIndex ?? session.currentQuestionIndex ?? 0;
        const question = session.questions[index];

        if (!question) {
            return res.status(400).json({ error: 'Invalid question index' });
        }

        const audioBuffer = await getQuestionAudio(question.question);

        res.set('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (err) {
        console.error('[Interview] TTS error:', err.message);
        res.status(500).json({ error: formatError(err) });
    }
};

/**
 * POST /api/ai/submit-answer
 * Multipart: audio file + sessionId
 * Flow: Whisper → Gemini evaluate → save → return feedback (Features 5–7)
 */
const submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({ error: 'Audio file is required' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const index = session.currentQuestionIndex;
        const questionObj = session.questions[index];

        if (!questionObj) {
            return res.status(400).json({ error: 'No current question' });
        }

        const { answerText, evaluation } = await processUserAnswer(
            audioFile.buffer,
            audioFile.mimetype || 'audio/webm',
            questionObj.question,
            session.cvData
        );

        const answerEntry = {
            questionIndex: index,
            questionId: questionObj.id,
            question: questionObj.question,
            answerText,
            evaluation,
            answeredAt: new Date()
        };

        session.answers = session.answers || [];
        session.messages = session.messages || [];

        const existing = session.answers.findIndex((a) => a.questionIndex === index);
        if (existing >= 0) {
            session.answers[existing] = answerEntry;
        } else {
            session.answers.push(answerEntry);
        }

        session.messages.push({ role: 'candidate', text: answerText });
        session.messages.push({ role: 'interviewer', text: `Feedback: ${evaluation.feedback}` });

        const isLastQuestion = index >= session.questions.length - 1;

        if (!isLastQuestion) {
            session.currentQuestionIndex = index + 1;
        } else {
            session.status = 'completed';
        }

        await session.save();

        res.json({
            message: 'Answer evaluated',
            answerText,
            evaluation,
            currentQuestionIndex: session.currentQuestionIndex,
            isLastQuestion,
            isComplete: session.status === 'completed',
            nextQuestion: isLastQuestion ? null : session.questions[session.currentQuestionIndex]
        });
    } catch (err) {
        console.error('[Interview] Submit answer error:', err.message);
        res.status(500).json({ error: formatError(err) });
    }
};

/**
 * GET /api/ai/session/:sessionId
 */
const getInterviewSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/ai/generate-report
 */
const generateReport = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const fullTranscript = (session.answers || [])
            .map((a) => `Q: ${a.question}\nA: ${a.answerText}\nScore: ${a.evaluation?.score}`)
            .join('\n\n');

        const report = await generateFeedbackReport(
            fullTranscript,
            session.jobRole,
            session.cvData
        );

        session.report = report;
        session.status = 'completed';
        await session.save();

        res.json({ report });
    } catch (err) {
        console.error('[Interview] Report error:', err.message);
        res.status(500).json({ error: formatError(err) });
    }
};

module.exports = {
    prepareInterview,
    startInterview,
    speakQuestion,
    submitAnswer,
    getInterviewSession,
    generateReport
};
