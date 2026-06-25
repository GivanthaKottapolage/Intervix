const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const FALLBACK_MODELS = [...new Set([
    PRIMARY_MODEL,
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro'
].filter(Boolean))];

const MAX_PROMPT_CHARS = 28000;

const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_PROMPT_CHARS);
};

const isRetryable = (err) => {
    const message = err?.message || '';
    return (
        err?.status === 503 ||
        err?.status === 429 ||
        message.includes('503') ||
        message.includes('429') ||
        message.includes('high demand') ||
        message.includes('quota') ||
        message.includes('ResourceExhausted')
    );
};

const shouldTryNextModel = (err) => {
    const message = err?.message || '';
    return (
        err?.status === 400 ||
        err?.status === 404 ||
        message.includes('404') ||
        message.includes('not found') ||
        message.includes('Invalid value at') ||
        message.includes('INVALID_ARGUMENT')
    );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateText = async (model, prompt) => {
    const text = sanitizeText(prompt);
    if (!text) {
        throw new Error('Prompt text is empty');
    }

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text }] }]
    });

    return result.response.text();
};

const generateWithParts = async (model, parts) => {
    const cleanedParts = parts
        .map((part) => {
            if (typeof part === 'string') {
                const text = sanitizeText(part);
                return text ? { text } : null;
            }
            if (part?.text) {
                const text = sanitizeText(part.text);
                return text ? { text } : null;
            }
            if (part?.inlineData?.data) {
                return part;
            }
            return null;
        })
        .filter(Boolean);

    if (cleanedParts.length === 0) {
        throw new Error('No valid content parts to send to Gemini');
    }

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: cleanedParts }]
    });

    return result.response.text();
};

const withGeminiRetry = async (fn, purpose = 'gemini') => {
    let lastError;

    for (const modelName of FALLBACK_MODELS) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                console.log(`[Gemini] ${purpose} | model=${modelName} | attempt=${attempt + 1}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                return await fn(model);
            } catch (err) {
                lastError = err;
                if (!isRetryable(err)) throw err;

                const delayMs = 2000 * (attempt + 1);
                console.warn(`[Gemini] Rate limit on ${modelName}, retry in ${delayMs}ms`);
                await sleep(delayMs);
            }
        }
    }

    throw lastError;
};

module.exports = {
    withGeminiRetry,
    generateText,
    generateWithParts,
    sanitizeText,
    genAI
};
