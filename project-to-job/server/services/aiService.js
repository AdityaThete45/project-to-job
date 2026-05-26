const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error("Failed to initialize GoogleGenerativeAI SDK:", err);
  }
} else {
  console.warn("Warning: GEMINI_API_KEY is not defined. AI Service will operate in Mock mode.");
}

// Helper to query Gemini with system prompt
const queryGemini = async (prompt, systemInstruction = "", responseType = "text") => {
  if (!genAI) {
    return getFallbackResponse(prompt);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: responseType === "json" ? { responseMimeType: "application/json" } : undefined,
    });

    const fullPrompt = systemInstruction 
      ? `System Instructions:\n${systemInstruction}\n\nUser Input:\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    
    if (responseType === "json") {
      return JSON.parse(text);
    }
    return text;
  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    return getFallbackResponse(prompt, error);
  }
};

// Fallback logic in case API Key is missing or rate limited
function getFallbackResponse(prompt, error = null) {
  console.log("Using Mock/Fallback AI Response");
  
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes("resume") || promptLower.includes("ats")) {
    return {
      atsScore: 78,
      skillsExtracted: ["React", "JavaScript", "HTML", "CSS", "Node.js", "Express", "MongoDB"],
      missingKeywords: ["TypeScript", "Docker", "Jest", "CI/CD", "Tailwind CSS"],
      matchPercentage: 82,
      suggestions: [
        "Incorporate specific metrics (e.g. 'boosted performance by 20%').",
        "Add TypeScript to your technical projects to show modern frontend skills.",
        "Include unit testing libraries like Jest or Mocha."
      ]
    };
  }
  
  if (promptLower.includes("github") || promptLower.includes("repository") || promptLower.includes("commit")) {
    return {
      qualityScore: 85,
      githubSummary: "Well-structured repository with consistent commits. Code demonstrates solid modularization and semantic HTML/CSS structures.",
      architectureQuality: "High: Separates routing, controllers, and database models.",
      codeComplexity: "Medium: Standard CRUD endpoints. Clean asynchronous handlers.",
      readmeQuality: "Excellent: Clear setup instructions and feature list.",
      originalityScore: 90,
      roadmap: [
        "Add unit tests for route logic.",
        "Implement API rate limiting to protect auth endpoints.",
        "Introduce TypeScript type safety."
      ]
    };
  }

  if (promptLower.includes("interview") || promptLower.includes("mock")) {
    return {
      score: 82,
      communicationRating: "Good: Answers are structured but could use specific STAR framework examples.",
      technicalRating: "Strong: Solid comprehension of Javascript Event Loop and DOM updates.",
      constructiveFeedback: "Try to explain 'why' you choose a database instead of just saying you used it. Elaborate on scaling aspects.",
      suggestedAnswers: [
        "Explain MongoDB's document model flexibility.",
        "Elaborate on JWT statelessness and its security implications."
      ]
    };
  }

  if (promptLower.includes("roadmap") || promptLower.includes("target company")) {
    return `### Personalized Learning Roadmap

#### Phase 1: Core Fundamentals (Weeks 1-2)
*   **Topic**: Advanced JavaScript & TypeScript
*   **Goal**: Master asynchronous patterns, closures, generics, and interface structures.

#### Phase 2: Frontend Engineering (Weeks 3-4)
*   **Topic**: Tailwind CSS & Framer Motion
*   **Goal**: Implement responsive, glassmorphic UI cards and smooth route transition animations.

#### Phase 3: Backend Scalability (Weeks 5-6)
*   **Topic**: Database Indexing & Caching
*   **Goal**: Set up indexes in MongoDB and integrate Redis caching for database query optimization.`;
  }

  return `I am your AI Career Copilot. How can I help you refine your projects, boost your resume, or prepare for interviews? (${error ? 'API offline' : 'Mock Mode'})`;
}

/* =====================================================
   AI RESUME ANALYZER
   ===================================================== */
exports.analyzeResume = async (resumeText, jobDescription = "") => {
  const systemInstruction = `You are an expert AI Resume Evaluator and Technical ATS Screener. 
Evaluate the resume text and compare it with the job description if provided. 
You must respond with a strictly formatted JSON object containing the following keys:
{
  "atsScore": number (1-100),
  "skillsExtracted": string[],
  "missingKeywords": string[],
  "matchPercentage": number (1-100),
  "suggestions": string[]
}`;

  const prompt = `Resume Text:\n${resumeText}\n\nJob Description:\n${jobDescription}`;
  return await queryGemini(prompt, systemInstruction, "json");
};

/* =====================================================
   AI PROJECT INTELLIGENCE
   ===================================================== */
exports.analyzeProjectIntelligence = async (projectDetails) => {
  const systemInstruction = `You are a Senior Technical Architect auditing a developer's project code structure and metadata.
Analyze the project details and return a strictly formatted JSON object with:
{
  "qualityScore": number (1-100),
  "githubSummary": string,
  "architectureQuality": string,
  "codeComplexity": string,
  "readmeQuality": string,
  "originalityScore": number (1-100),
  "roadmap": string[]
}`;

  const prompt = `Project Title: ${projectDetails.title}
Role in Project: ${projectDetails.role}
Description: ${projectDetails.description}
Tech Stack: ${projectDetails.techStack}
GitHub Stats: ${JSON.stringify(projectDetails.githubStats)}`;

  return await queryGemini(prompt, systemInstruction, "json");
};

/* =====================================================
   AI CAREER COPILOT CHAT
   ===================================================== */
exports.chatCareerCopilot = async (messages) => {
  const systemInstruction = `You are the P2J AI Career Copilot. You guide students on project architecture, skill roadmaps, resume refinements, and placement strategies. Keep responses highly inspiring, professional, and structured in Markdown. Limit responses to 300 words.`;
  
  // Format history for prompt
  const prompt = messages.map(m => `${m.role === 'user' ? 'Student' : 'Copilot'}: ${m.content}`).join("\n");
  return await queryGemini(prompt, systemInstruction, "text");
};

/* =====================================================
   AI MOCK INTERVIEW SYSTEM
   ===================================================== */
exports.conductMockInterview = async (roleType, topic, answers) => {
  const systemInstruction = `You are a Technical and HR Interviewer grading a candidate's response.
Analyze the interview dialog/answers and grade them. Return a strictly formatted JSON object:
{
  "score": number (1-100),
  "communicationRating": string,
  "technicalRating": string,
  "constructiveFeedback": string,
  "suggestedAnswers": string[]
}`;

  const prompt = `Role Type: ${roleType}
Topic: ${topic}
QA Conversation:\n${JSON.stringify(answers)}`;

  return await queryGemini(prompt, systemInstruction, "json");
};

/* =====================================================
   AI ROADMAP GENERATOR
   ===================================================== */
exports.generateLearningRoadmap = async (skills, targetCompany, weakAreas, goals) => {
  const systemInstruction = `You are an elite career development coach. Create a detailed, actionable, week-by-week learning roadmap in Markdown format based on the user's goals. Include specific resources, project suggestions, and milestone checkpoints.`;
  
  const prompt = `Current Skills: ${skills.join(", ")}
Target Company: ${targetCompany}
Weak Areas: ${weakAreas}
Career Goals: ${goals}`;

  return await queryGemini(prompt, systemInstruction, "text");
};

/* =====================================================
   AI CANDIDATE SUMMARY & AUTHENTICITY DETECTION
   ===================================================== */
exports.generateCandidateSummary = async (student, projects) => {
  const systemInstruction = `You are a startup CTO and Lead Technical Recruiter.
Analyze the candidate's academic details, skills, and projects. 
Evaluate project authenticity and flag potential copied repos, low contribution consistency, or fake credentials.
Return a strictly formatted JSON response:
{
  "technicalSummary": "A concise summary of their skills and capabilities.",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "authenticityAudit": {
    "suspiciousActivityDetected": false,
    "confidenceScore": 90,
    "explanation": "No plagiarism flags. Consistent commits across multiple repositories."
  },
  "hiringRecommendation": "A detailed hiring recommendation.",
  "readinessRating": "L3 - Software Engineer (Full Stack)"
}`;

  const prompt = `Student Details: ${JSON.stringify({
    name: student.name,
    college: student.college,
    cgpa: student.cgpa,
    skills: student.skills,
    trustScore: student.trustScore,
    trustRank: student.trustRank
  })}
Projects: ${JSON.stringify(projects.map(p => ({
    title: p.title,
    techStack: p.techStack,
    proofScore: p.proofScore,
    isVerified: p.isVerified,
    githubStats: p.githubStats,
    aiInsights: p.aiInsights
  })))}`;

  return await queryGemini(prompt, systemInstruction, "json");
};
