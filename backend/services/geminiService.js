const { withGeminiRetry, generateText } = require('./geminiClient');

const DEFAULT_COUNT = parseInt(process.env.DEFAULT_QUESTION_COUNT || '5', 10);

const parseJsonFromGemini = (text) => {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
};

/**
 * Feature 1 — Generate all interview questions in ONE Gemini call.
 */
const generateInterviewQuestions = async (cvData, sessionMeta = {}, questionCount = DEFAULT_COUNT) => {
    const count = Math.min(Math.max(parseInt(questionCount, 10) || DEFAULT_COUNT, 3), 15);

    const compactCv = {
        name: cvData?.name,
        skills: (cvData?.skills || []).slice(0, 8),
        projects: (cvData?.projects || []).slice(0, 3),
        experience: (cvData?.experience || []).slice(0, 3),
        education: (cvData?.education || []).slice(0, 2),
        summary: cvData?.summary
    };

    const cvString = JSON.stringify(compactCv);

    const prompt = `Generate exactly ${count} interview questions for a ${sessionMeta.jobRole || 'Software Engineer'} candidate.

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
- Only generate the number of questions requested (${count})
- Follow the order above strictly
- For questions 10-11, reference ACTUAL project names from the CV
- Each question must be unique
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
const getInterviewerResponse = async (transcript, role, questionCount, cvText) => {
    const systemPrompt = `You are a professional interviewer for a ${role} position.

Here is the candidate's CV:
-----
${cvText || 'No CV provided'}
-----

Follow this exact interview structure based on the question number:

Question 1: Always start with "Please introduce yourself and tell me about your background."

Questions 2-3: Ask about OOP concepts
- Encapsulation, Inheritance, Polymorphism, Abstraction
- Ask for real examples from their projects
- Example: "Can you explain polymorphism and give me an example from your own code?"

Questions 4-5: Ask about Data Structures & Algorithms (DSA)
- Arrays, LinkedLists, Stacks, Queues, Trees, Sorting algorithms
- Example: "What is the difference between a stack and a queue? When would you use each?"

Questions 6-7: Ask about CRUD & SQL
- Database operations, SQL queries, joins, indexes
- Example: "Can you write a SQL query to find all users who have placed more than 3 orders?"

Questions 8-9: Ask about System Architecture
- Client-server model, REST APIs, MVC pattern, microservices basics
- Example: "Can you explain how a REST API works and what makes it RESTful?"

Questions 10-11: Ask about their specific projects from CV
- Reference their actual projects by name
- Example: "I see you built a job recommendation system — what was the biggest technical challenge you faced?"
- Ask about tools they used and why they chose them

Questions 12-13: Ask about tools and workflow
- Version control (Git), IDEs, testing, deployment
- Example: "What tools do you use in your development workflow and why?"

Question 14+: Ask about challenges and learning
- "What was the hardest bug you ever fixed and how did you solve it?"
- "What are you currently learning to improve your skills?"

RULES:
- Ask ONE question at a time
- Be professional but friendly and encouraging
- Keep your response to maximum 2 sentences
- Reference their CV when asking project questions
- Current question number is: ${questionCount}
- Do NOT repeat questions already asked in the transcript`;


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
