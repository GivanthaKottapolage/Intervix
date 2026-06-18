const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash'
].filter(Boolean);

const FALLBACK_MODELS = [...new Set(MODELS)];

const isRetryable = (err) => {
  const message = err?.message || '';
  return (
    err?.status === 503 ||
    err?.status === 429 ||
    message.includes('503') ||
    message.includes('429') ||
    message.includes('high demand') ||
    message.includes('Service Unavailable')
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withGeminiRetry = async (fn) => {
  let lastError;

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return await fn(model);
      } catch (err) {
        lastError = err;
        if (!isRetryable(err)) throw err;

        const delayMs = 1000 * (attempt + 1);
        console.warn(
          `Gemini model "${modelName}" busy (attempt ${attempt + 1}/3), retrying in ${delayMs}ms...`
        );
        await sleep(delayMs);
      }
    }

    console.warn(`Switching Gemini model from "${modelName}" to next fallback...`);
  }

  throw lastError;
};

module.exports = { withGeminiRetry, genAI };
