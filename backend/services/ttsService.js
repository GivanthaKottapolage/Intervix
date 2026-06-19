/**
 * Feature 3 — Google TTS via gTTS-style free API (no API key).
 * Uses google-tts-api to fetch MP3 from Google Translate TTS.
 */
const googleTTS = require('google-tts-api');
const axios = require('axios');

const convertToSpeech = async (text, lang = 'en') => {
    if (!text || !text.trim()) {
        throw new Error('TTS text cannot be empty');
    }

    console.log('[TTS] Converting to speech:', text.slice(0, 80) + (text.length > 80 ? '...' : ''));

    const urls = googleTTS.getAllAudioUrls(text, {
        lang,
        slow: false,
        host: 'https://translate.google.com'
    });

    const buffers = [];

    for (const chunk of urls) {
        const audioUrl = typeof chunk === 'string' ? chunk : chunk?.url;

        if (!audioUrl) {
            continue;
        }

        const response = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.data || response.data.length === 0) {
            throw new Error('TTS service returned no audio data');
        }

        buffers.push(Buffer.from(response.data));
    }

    if (buffers.length === 0) {
        throw new Error('No audio URLs were generated for the provided text');
    }

    const audioBuffer = Buffer.concat(buffers);
    console.log('[TTS] Audio generated, bytes:', audioBuffer.length);
    return audioBuffer;
};

module.exports = { convertToSpeech };
