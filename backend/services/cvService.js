const pdfParse = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');
const { withGeminiRetry } = require('./geminiClient');

const extractCVText = async (filePathOrUrl) => {
  try {
    let fileBuffer;

    if (filePathOrUrl.startsWith('http')) {
      console.log('[cvService] Downloading from:', filePathOrUrl);
      const response = await axios.get(filePathOrUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': '*/*'
        }
      });
      fileBuffer = Buffer.from(response.data);
      console.log('[cvService] Downloaded bytes:', fileBuffer.length);
    } else {
      fileBuffer = fs.readFileSync(filePathOrUrl);
    }

    const data = await pdfParse(fileBuffer);
    const rawText = data?.text?.replace(/\s+/g, ' ').trim() || '';

    if (!rawText) {
      throw new Error('The uploaded PDF does not contain readable text. Please upload a valid text-based PDF.');
    }

    console.log('📄 Raw text extracted, characters:', rawText.length);

    const cvData = await withGeminiRetry(async (model) => {
      const result = await model.generateContent(`
      Here is raw text extracted from a candidate's CV:
      -----
      ${rawText}
      -----
      
      Extract and return ONLY valid JSON. No markdown, no extra text.
      Use exactly this structure:
      {
        "name": "candidate full name",
        "email": "email if found",
        "skills": ["skill1", "skill2"],
        "education": ["degree and university"],
        "projects": [
          {
            "name": "project name",
            "description": "what it does",
            "technologies": ["tech1", "tech2"]
          }
        ],
        "experience": [
          {
            "company": "company name",
            "role": "job title",
            "duration": "time period",
            "responsibilities": "what they did"
          }
        ],
        "summary": "2 sentence summary of this candidate"
      }
    `);

      const responseText = result.response.text();
      const clean = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    });

    console.log('✅ CV structured by Gemini successfully');
    return cvData;

  } catch (err) {
    const message = err?.message || 'Unknown PDF parsing error';
    console.error('❌ CV extraction error:', message);

    if (
      message.includes('Invalid PDF') ||
      message.includes('bad XRef') ||
      message.includes('root reference') ||
      message.includes('readable text')
    ) {
      throw new Error('Unable to read the PDF. Please upload a valid PDF with readable text.');
    }

    throw new Error(message);
  }
};

module.exports = { extractCVText };