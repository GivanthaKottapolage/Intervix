const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const FALLBACK_MODELS = [...new Set([
    PRIMARY_MODEL,
    'gemini-2.5-flash',
    'gemini-2.5-pro'
].filter(Boolean))];

const isRetryable = (err) => {
    const message = err?.message || '';
    return (
        err?.status === 503 ||
        err?.status === 429 ||
        message.includes('503') ||
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('ResourceExhausted')
    );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

module.exports = { withGeminiRetry, genAI };
