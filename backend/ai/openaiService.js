const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt for AI Mentor
 */
const MENTOR_SYSTEM_PROMPT = `You are NeuroTrack AI, an intelligent learning mentor and career coach. 
You help students track their learning progress, identify weak areas, and build effective study strategies.
You are knowledgeable about:
- Computer Science and Software Development
- Learning psychology and spaced repetition
- Career paths in tech (Full Stack, AI/ML, DevOps, etc.)
- Industry trends and job market
- Study techniques and productivity

Guidelines:
- Be encouraging, concise, and actionable
- Use markdown formatting for better readability
- Provide specific, personalized advice based on user context
- When asked about revision, reference spaced repetition principles
- Always end with a motivating note`;

/**
 * Chat with AI Mentor
 * @param {Array} messages - Array of {role, content}
 * @param {Object} userContext - User data for personalization
 * @returns {string} AI response
 */
const chatWithMentor = async (messages, userContext = {}) => {
  const systemMessage = {
    role: 'system',
    content: `${MENTOR_SYSTEM_PROMPT}
    
User Context:
- Name: ${userContext.name || 'Student'}
- Career Goal: ${userContext.careerGoal || 'Software Developer'}
- Current Streak: ${userContext.streak || 0} days
- Career Readiness: ${userContext.careerReadinessScore || 0}%
- Weak Topics: ${userContext.weakTopics?.join(', ') || 'None identified yet'}`,
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMessage, ...messages],
    max_tokens: 1000,
    temperature: 0.7,
    stream: false,
  });

  return response.choices[0].message.content;
};

/**
 * Generate Career Roadmap
 * @param {string} careerGoal
 * @param {Array} currentSkills
 * @param {number} experienceLevel - 1 (beginner) to 5 (expert)
 * @returns {Object} Roadmap structure
 */
const generateRoadmap = async (careerGoal, currentSkills = [], experienceLevel = 1) => {
  const prompt = `Generate a personalized 6-month learning roadmap for someone who wants to become a ${careerGoal}.

Current skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'Beginner (minimal skills)'}
Experience level: ${experienceLevel}/5

Return a JSON object with this exact structure:
{
  "title": "Roadmap title",
  "description": "Brief description",
  "totalDuration": 6,
  "milestones": [
    {
      "month": 1,
      "title": "Month 1 title",
      "description": "What to learn",
      "skills": ["skill1", "skill2"],
      "resources": [
        {"title": "Resource name", "url": "https://example.com", "type": "course"}
      ]
    }
  ],
  "aiRecommendations": ["tip1", "tip2", "tip3"]
}

Make the roadmap realistic, progressive, and industry-aligned. Include real resource URLs where possible.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Analyze Skill Gaps
 * @param {string} careerGoal
 * @param {Array} currentSkills - [{name, proficiency}]
 * @returns {Object} Gap analysis result
 */
const analyzeSkillGaps = async (careerGoal, currentSkills = []) => {
  const skillsList = currentSkills.map((s) => `${s.name} (${s.proficiency}%)`).join(', ');

  const prompt = `Analyze skill gaps for someone targeting: ${careerGoal}

Current skills: ${skillsList || 'None specified'}

Return a JSON object:
{
  "careerReadinessScore": 45,
  "missingSkills": [
    {
      "name": "Docker",
      "category": "devops",
      "priority": "high",
      "industryDemand": 85,
      "trending": true,
      "estimatedHours": 20,
      "resources": [{"title": "Docker Tutorial", "url": "https://docs.docker.com", "type": "article"}]
    }
  ],
  "strongSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "nextSteps": ["step1", "step2", "step3"],
  "industryTrends": [{"name": "AI/ML", "demand": 92, "trending": true}]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Generate Quiz Questions for a topic
 * @param {string} topicName
 * @param {string} difficulty
 * @param {number} count
 * @returns {Array} Quiz questions
 */
const generateQuiz = async (topicName, difficulty = 'intermediate', count = 5) => {
  const prompt = `Generate ${count} multiple choice quiz questions about "${topicName}" at ${difficulty} level.

Return JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Why A is correct",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * Explain why a student is weak in a topic
 * @param {string} topicName
 * @param {Array} mistakeHistory
 * @returns {string} Analysis and recommendations
 */
const analyzeWeakness = async (topicName, mistakeHistory = []) => {
  const mistakes = mistakeHistory
    .slice(0, 5)
    .map((m) => `Q: ${m.question} | Wrong: ${m.userAnswer} | Correct: ${m.correctAnswer}`)
    .join('\n');

  const prompt = `A student is struggling with "${topicName}". 

Recent mistakes:
${mistakes || 'No specific mistakes recorded yet.'}

Provide:
1. Why they might be struggling (2-3 key reasons)
2. Specific study strategies for this topic
3. Common misconceptions to avoid
4. Practice exercises (3 examples)
5. Resources to improve

Format as clear, encouraging markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

module.exports = {
  chatWithMentor,
  generateRoadmap,
  analyzeSkillGaps,
  generateQuiz,
  analyzeWeakness,
};
