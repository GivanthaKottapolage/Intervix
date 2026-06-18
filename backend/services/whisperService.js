const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcribeAudio = async (audioBuffer) => {
    const response = await openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
    });
    return response.text;
};

module.exports = { transcribeAudio };