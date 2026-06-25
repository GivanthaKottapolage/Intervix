/**
 * Feature 5 — Audio transcription via Gemini (no OpenAI key needed).
 * Sends the audio file to Gemini and asks it to return a verbatim transcript.
 */
const { withGeminiRetry, generateWithParts } = require('./geminiClient');

const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
    console.log('[Transcribe] Processing memory buffer of size:', audioBuffer ? audioBuffer.length : 0);

    if (!audioBuffer) {
        throw new Error('Audio buffer is empty or missing');
    }

    const base64 = audioBuffer.toString('base64');

    const prompt = 'Transcribe the following audio exactly as spoken. Return ONLY the transcribed text, nothing else.';

    const text = await withGeminiRetry(async (model) => {
        const transcript = (await generateWithParts(model, [
            prompt,
            { inlineData: { mimeType, data: base64 } }
        ])).trim();
        console.log('[Transcribe] Result:', transcript.slice(0, 100));
        return transcript;
    }, 'transcribe_audio');

    return text;
};

module.exports = { transcribeAudio };
