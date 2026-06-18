const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const convertToSpeech = async (text) => {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-preview-tts'
    });

    const result = await model.generateContent({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: 'Charon' // deep professional voice
                    }
                }
            }
        }
    });

    const audioData = result.response.candidates[0]
        .content.parts[0].inlineData.data;

    // returns base64 audio — convert to buffer
    return Buffer.from(audioData, 'base64');
};

module.exports = { convertToSpeech };