/**
 * Feature 5 — Audio transcription via Gemini (no OpenAI key needed).
 * Sends the audio file to Gemini and asks it to return a verbatim transcript.
 */
const fs = require('fs');
const path = require('path');
const { withGeminiRetry } = require('./geminiClient');

const MIME_MAP = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
};

const transcribeAudio = async (filePath) => {
    console.log('[Transcribe] Reading file:', filePath);

    const audioBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext] || 'audio/webm';
    const base64 = audioBuffer.toString('base64');

    const prompt = 'Transcribe the following audio exactly as spoken. Return ONLY the transcribed text, nothing else.';

    const text = await withGeminiRetry(async (model) => {
        const result = await model.generateContent([
            { text: prompt },
            { inlineData: { mimeType, data: base64 } }
        ]);
        const transcript = result.response.text().trim();
        console.log('[Transcribe] Result:', transcript.slice(0, 100));
        return transcript;
    }, 'transcribe_audio');

    return text;
};

module.exports = { transcribeAudio };
