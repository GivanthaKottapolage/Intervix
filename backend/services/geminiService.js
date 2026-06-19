const { withGeminiRetry } = require('./geminiClient');

// Called during interview — generates next question
const getInterviewerResponse = async (transcript, role, questionCount, cvText) => {
  const systemPrompt = `You are a professional interviewer for a ${role} position.
  
  Here is the candidate's CV:
  -----
  ${cvText || 'No CV provided'}
  -----
  
  Use this CV to ask relevant personalised questions about their experience.
  Ask one question at a time. Be professional but friendly.
  Mix behavioural questions with CV-specific questions like:
  "I see you built X — tell me about the challenges you faced."
  This is question number ${questionCount}.
  If it's the first question start with "Tell me about yourself."
  Keep responses concise — max 2 sentences.`;

  const history = transcript.map(m => ({
    role: m.role === 'interviewer' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  return withGeminiRetry(async (model) => {
    const chat = model.startChat({
      history,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(
      transcript[transcript.length - 1]?.text || 'Start the interview'
    );

    const question = result.response.text();
    console.log(`\n❓ [Question #${questionCount}] ${question}\n`);
    return question;
  });
};

// Called when user clicks Generate Report
const generateFeedbackReport = async (fullTranscript, role, cvText) => {
  const prompt = `You are a professional interview coach.
  Role applied for: ${role}
  
  Candidate CV:
  -----
  ${cvText || 'No CV provided'}
  -----
  
  Full interview transcript:
  ${fullTranscript}
  
  Return ONLY valid JSON. No markdown, no extra text. Use this structure:
  {
    "overall_score": number,
    "communication": { "score": number, "feedback": string },
    "technical": { "score": number, "feedback": string },
    "confidence": { "score": number, "feedback": string },
    "strengths": [string, string, string],
    "improvements": [string, string, string],
    "better_answer_example": {
      "question": string,
      "their_answer": string,
      "stronger_answer": string
    },
    "recommendation": string
  }`;

  return withGeminiRetry(async (model) => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  });
};

module.exports = { getInterviewerResponse, generateFeedbackReport };
