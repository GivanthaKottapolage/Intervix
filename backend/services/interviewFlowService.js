/**
 * Orchestrates CV extract → question generation → interview steps.
 */
const { extractCVText } = require('./cvService');
const { generateInterviewQuestions, DEFAULT_COUNT } = require('./geminiService');
const { convertToSpeech } = require('./ttsService');
const { transcribeAudio } = require('./whisperService');
const { evaluateAnswer } = require('./geminiService');

const prepareSession = async (session, questionCount) => {
    const count = Math.max(questionCount || session.questionCount || DEFAULT_COUNT, 15);

    let cvData = session.cvData;
    if (!cvData && session.cvFilePath) {
        console.log('[Flow] Extracting CV from:', session.cvFilePath);
        cvData = await extractCVText(session.cvFilePath);
    }

    const questions = await generateInterviewQuestions(cvData, {
        jobRole: session.jobRole,
        preferedIndustry: session.preferedIndustry,
        experienceLevel: session.experienceLevel,
        areasToFocus: session.areasToFocus
    }, count);

    return { cvData, questions, questionCount: count };
};

const getQuestionAudio = async (questionText) => {
    return convertToSpeech(questionText);
};

const processUserAnswer = async (audioFilePath, question, cvData) => {
    const answerText = await transcribeAudio(audioFilePath);
    const evaluation = await evaluateAnswer(question, answerText, cvData);
    return { answerText, evaluation };
};

module.exports = {
    prepareSession,
    getQuestionAudio,
    processUserAnswer,
    DEFAULT_COUNT
};
