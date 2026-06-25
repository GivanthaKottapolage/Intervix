const { withGeminiRetry, generateText } = require('./geminiClient');

const DEFAULT_COUNT = parseInt(process.env.DEFAULT_QUESTION_COUNT || '15', 10);

const parseJsonFromGemini = (text) => {
    if (!text || typeof text !== 'string') throw new Error('No text to parse');

    // Try raw parse first (some responses are already pure JSON)
    try {
        return JSON.parse(text);
    } catch (e) {
        // Fall back to cleaning common fencing and try again
        const cleaned = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            // As a last resort, try to extract the first JSON array/object substring
            const m = cleaned.match(/(\[\s*\{[\s\S]*\}\s*\])|(\{[\s\S]*\})/);
            if (m && m[0]) {
                return JSON.parse(m[0]);
            }
            // Give a helpful error including a short preview
            const preview = cleaned.slice(0, 500);
            throw new Error(`Failed to parse JSON from Gemini response. Preview: ${preview}`);
        }
    }
};

/**
 * Feature 1 — Generate all interview questions in ONE Gemini call.
 */
const generateInterviewQuestions = async (cvData, sessionMeta = {}, questionCount = DEFAULT_COUNT) => {
    const count = Math.max(parseInt(questionCount, 10) || DEFAULT_COUNT, 15);

    // Normalize experience level inputs from frontend or callers
    const rawLevel = String(sessionMeta.experienceLevel || 'mid').toLowerCase().trim();
    const normalizeLevel = (s) => {
        if (!s) return 'mid';
        if (s.includes('intern')) return 'intern';
        if (s.includes('entry')) return 'entry';
        if (s.includes('junior')) return 'junior';
        if (s.includes('mid')) return 'mid';
        if (s.includes('senior')) return 'senior';
        if (s.includes('lead')) return 'lead';
        return 'mid';
    };
    const experienceLevel = normalizeLevel(rawLevel);

    const compactCv = {
        name: cvData?.name,
        skills: (cvData?.skills || []).slice(0, 8),
        projects: (cvData?.projects || []).slice(0, 3),
        experience: (cvData?.experience || []).slice(0, 3),
        education: (cvData?.education || []).slice(0, 2),
        summary: cvData?.summary
    };

    const cvString = JSON.stringify(compactCv);

    // Tailor prompt based on experience level (intern, junior, mid, senior)
    // let levelInstructions = '';
    // if (experienceLevel === 'intern' || experienceLevel === 'junior') {
    //     levelInstructions = 'Focus on fundamentals, practical examples, and basic problem-solving. Keep difficulty easy-to-medium and prefer hands-on, concrete questions.';
    // } else if (experienceLevel === 'senior' || experienceLevel === 'lead') {
    //     levelInstructions = 'Include advanced topics such as system design, scalability, architecture trade-offs, performance, and leadership/mentorship questions. Increase difficulty to medium-to-hard.';
    // } else {
    //     levelInstructions = 'Mix fundamentals with intermediate system design and practical problem solving. Keep difficulty medium.';
    // }
    let levelInstructions = '';
    if (experienceLevel === 'intern') {
        levelInstructions = `
        Focus heavily on basics and understanding.
        Topics: OOP basics, simple arrays/strings, very basic SQL, simple logic problems.
        Difficulty: easy.
        Keep questions very simple and beginner friendly.
        `;
    } 
    else if (experienceLevel === 'entry') {
        levelInstructions = `
        Focus on job-ready fundamentals.
        Topics: OOP concepts with examples, basic DSA, CRUD operations, SQL joins basics, simple APIs.
        Difficulty: easy-to-medium.
        `;
    } 
    else if (experienceLevel === 'junior') {
        levelInstructions = `
        Focus on practical coding and real-world usage.
        Topics: OOP with real project examples, medium DSA, SQL queries, REST API basics, debugging questions.
        Difficulty: medium.
        `;
    } 
    else if (experienceLevel === 'mid') {
        levelInstructions = `
        Focus on real-world problem solving and system understanding.
        Topics: Advanced OOP usage, DSA patterns, SQL optimization, REST APIs, caching basics, system design fundamentals.
        Difficulty: medium.
    `;
    } 
    else if (experienceLevel === 'senior') {
        levelInstructions = `
        Focus on system design and architecture thinking.
        Topics: scalability, microservices, distributed systems, performance optimization, design trade-offs, leadership experience.
        Difficulty: medium-to-hard.
        `;
    } 
    else if (experienceLevel === 'lead') {
        levelInstructions = `
        Focus on architecture + leadership + strategic decisions.
        Topics: large-scale system design, team leadership, reliability engineering, cloud architecture, high-level trade-offs.
        Difficulty: hard.
        `;
    } 
    else {
        levelInstructions = `
        Mix fundamentals with system design and practical problem solving.
        Difficulty: medium.
        `;
    }

    const prompt = `Generate exactly ${count} interview questions for a ${sessionMeta.jobRole || 'Software Engineer'} candidate at the ${experienceLevel} level. ${levelInstructions}

Candidate CV:
${cvString}

IMPORTANT:
Candidate Experience Level: ${normalizedLevel}

The interview structure, question complexity, and topics MUST adapt to the candidate's experience level.

Do NOT ask senior-level architecture questions to interns.
Do NOT ask beginner-level questions to senior candidates.

INTERVIEW STRUCTURE:

FOR INTERN:
1. Introduction
2-4. OOP Fundamentals
5-7. Basic DSA (Arrays, Strings, Stack, Queue basics)
8-9. Basic SQL & CRUD
10-11. CV Projects
12-13. Git, IDEs and Development Tools
14+. Learning, Problem Solving and Career Goals

FOR ENTRY LEVEL:
1. Introduction
2-3. OOP Concepts
4-5. DSA Fundamentals
6-7. CRUD & SQL
8-9. REST APIs and MVC
10-11. CV Projects
12-13. Tools & Workflow
14+. Challenges & Learning

FOR JUNIOR:
1. Introduction
2-3. OOP with real examples
4-5. DSA and Problem Solving
6-7. SQL Queries and CRUD
8-9. REST APIs, MVC and Debugging
10-11. CV Projects
12-13. Git, Testing and Deployment
14+. Technical Challenges & Learning

FOR MID:
1. Introduction
2-3. Advanced OOP and Design Principles
4-5. DSA Optimization
6-7. Database Design and SQL Optimization
8-9. System Design Fundamentals
10-11. CV Projects
12-13. Testing, CI/CD and Deployment
14+. Real-world Challenges & Learning

FOR SENIOR:
1. Introduction
2-3. Design Patterns and Advanced OOP
4-5. Algorithm Trade-offs
6-7. Database Scaling and Optimization
8-11. System Design, Scalability, Microservices, Caching, CAP Theorem
12-13. Leadership, Mentoring and Architecture Decisions
14+. Technical Challenges, Innovation and Future Vision

FOR LEAD:
1. Introduction
2-3. Software Architecture Principles
4-5. Large-scale System Design
6-7. Data Architecture and Reliability
8-11. Distributed Systems, Scalability, Performance and Trade-offs
12-13. Leadership, Team Management and Strategic Decisions
14+. Organizational Challenges and Technical Vision

IMPORTANT RULES:
- Only generate exactly ${count} questions
- Follow the structure for the candidate's experience level
- For questions 10-11, reference ACTUAL project names from the CV
- Each question must be unique
- Difficulty must match the experience level
- Intern = easy
- Entry = easy-medium
- Junior = medium
- Mid = medium-medium+
- Senior = hard
- Lead = hard+
- Be professional but friendly

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {"id":1,"question":"Please introduce yourself and tell me about your background.","category":"introduction","difficulty":"easy"},
  {"id":2,"question":"Can you explain encapsulation with a real example?","category":"oop","difficulty":"medium"}
]`;

    const questions = await withGeminiRetry(async (model) => {
        const raw = await generateText(model, prompt);
        console.log('[Gemini] Raw question response length:', raw.length);

        const parsed = parseJsonFromGemini(raw);
        const list = Array.isArray(parsed) ? parsed : parsed.questions;

        if (!list || list.length === 0) {
            throw new Error('Gemini returned no questions');
        }

        return list.slice(0, count).map((q, i) => ({
            id: q.id || i + 1,
            question: q.question,
            category: q.category || 'general',
            difficulty: q.difficulty || 'medium'
        }));
    }, 'generate_questions');

    console.log('\n========== GENERATED INTERVIEW QUESTIONS ==========');
    questions.forEach((q) => {
        console.log(`  Q${q.id}: ${q.question}`);
    });
    console.log('===================================================\n');

    return questions;
};

/**
 * Feature 6 — Evaluate one answer with structured JSON feedback.
 */
const evaluateAnswer = async (question, answerText, cvData) => {
    const prompt = `Evaluate this interview answer.

Question: ${question}
User Answer: ${answerText}
CV Summary: ${cvData?.summary || JSON.stringify(cvData || {}).slice(0, 500)}

Return ONLY valid JSON:
{
  "correct": true,
  "score": 8,
  "feedback": "Good explanation but add more technical details",
  "improvement": "Explain your architecture clearly"
}

Score 0-10. "correct" is true if score >= 6.`;

    return withGeminiRetry(async (model) => {
        const evaluation = parseJsonFromGemini(await generateText(model, prompt));
        console.log(`[Gemini] Evaluation score: ${evaluation.score} | correct: ${evaluation.correct}`);
        return evaluation;
    }, 'evaluate_answer');
};

/**
 * Called during interview — generates the next question dynamically
 * using the conversation transcript and CV.
 */
const getInterviewerResponse = async (
    transcript,
    role,
    questionCount,
    cvText,
    experienceLevel = 'mid'
) => {
    const rawLevel = String(experienceLevel || 'mid').toLowerCase().trim();
    const normalizeLevel = (s) => {
        if (!s) return 'mid';
        if (s.includes('intern')) return 'intern';
        if (s.includes('entry')) return 'entry';
        if (s.includes('junior')) return 'junior';
        if (s.includes('mid')) return 'mid';
        if (s.includes('senior')) return 'senior';
        if (s.includes('lead')) return 'lead';
        return 'mid';
    };
    const normalizedLevel = normalizeLevel(rawLevel);

    const systemPrompt = `You are a professional interviewer for a ${role} position.

Here is the candidate's CV:
-----
${cvText || 'No CV provided'}
-----

Follow this exact interview structure based on the question number:

IMPORTANT:
Candidate Experience Level: ${normalizedLevel}

The interview structure, question complexity, and topics MUST adapt to the candidate's experience level.

Do NOT ask senior-level architecture questions to interns.
Do NOT ask beginner-level questions to senior candidates.

INTERVIEW STRUCTURE:

FOR INTERN:
1. Introduction
2-4. OOP Fundamentals
5-7. Basic DSA (Arrays, Strings, Stack, Queue basics)
8-9. Basic SQL & CRUD
10-11. CV Projects
12-13. Git, IDEs and Development Tools
14+. Learning, Problem Solving and Career Goals

FOR ENTRY LEVEL:
1. Introduction
2-3. OOP Concepts
4-5. DSA Fundamentals
6-7. CRUD & SQL
8-9. REST APIs and MVC
10-11. CV Projects
12-13. Tools & Workflow
14+. Challenges & Learning

FOR JUNIOR:
1. Introduction
2-3. OOP with real examples
4-5. DSA and Problem Solving
6-7. SQL Queries and CRUD
8-9. REST APIs, MVC and Debugging
10-11. CV Projects
12-13. Git, Testing and Deployment
14+. Technical Challenges & Learning

FOR MID:
1. Introduction
2-3. Advanced OOP and Design Principles
4-5. DSA Optimization
6-7. Database Design and SQL Optimization
8-9. System Design Fundamentals
10-11. CV Projects
12-13. Testing, CI/CD and Deployment
14+. Real-world Challenges & Learning

FOR SENIOR:
1. Introduction
2-3. Design Patterns and Advanced OOP
4-5. Algorithm Trade-offs
6-7. Database Scaling and Optimization
8-11. System Design, Scalability, Microservices, Caching, CAP Theorem
12-13. Leadership, Mentoring and Architecture Decisions
14+. Technical Challenges, Innovation and Future Vision

FOR LEAD:
1. Introduction
2-3. Software Architecture Principles
4-5. Large-scale System Design
6-7. Data Architecture and Reliability
8-11. Distributed Systems, Scalability, Performance and Trade-offs
12-13. Leadership, Team Management and Strategic Decisions
14+. Organizational Challenges and Technical Vision

IMPORTANT RULES:
- Follow the structure for the candidate's experience level
- For questions 10-11, reference ACTUAL project names from the CV
- Each question must be unique
- Difficulty must match the experience level
- Intern = easy
- Entry = easy-medium
- Junior = medium
- Mid = medium-medium+
- Senior = hard
- Lead = hard+
- Be professional but friendly
- Ask ONE question at a time
- Keep response under 2 sentences
- Current question number: ${questionCount}
- Do not repeat previous questions
`;


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
    }, 'interviewer_response');
};

const generateFeedbackReport = async (fullTranscript, role, cvData) => {
    const prompt = `You are a professional interview coach.
Role applied for: ${role}

Candidate CV:
-----
${cvData ? JSON.stringify(cvData).slice(0, 800) : 'No CV provided'}
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
        return parseJsonFromGemini(await generateText(model, prompt));
    }, 'generate_report');
};

module.exports = {
    generateInterviewQuestions,
    evaluateAnswer,
    getInterviewerResponse,
    generateFeedbackReport,
    DEFAULT_COUNT
};
