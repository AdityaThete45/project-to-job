const aiService = require("../services/aiService");
const Project = require("../models/Project");

// 1. Resume Analyzer
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required." });
    }
    const analysis = await aiService.analyzeResume(resumeText, jobDescription);
    res.json(analysis);
  } catch (error) {
    console.error("AI Resume Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze resume." });
  }
};

// 2. Project Auditing & In-depth Quality Assessment
exports.auditProjectQuality = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const assessment = await aiService.analyzeProjectIntelligence(project);
    
    // Save the upgraded AI insights directly back to the project model!
    project.aiInsights = {
      ownershipVerified: project.aiInsights.ownershipVerified,
      commitQuality: assessment.githubSummary,
      repoMaturity: assessment.architectureQuality,
      recommendation: `Quality Score: ${assessment.qualityScore}/100. ${assessment.readmeQuality}.`
    };
    
    // Check if score changed
    project.authenticityScore = assessment.qualityScore;
    await project.save();

    res.json(assessment);
  } catch (error) {
    console.error("AI Project Audit Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze project." });
  }
};

// 3. Career Copilot
exports.chatCopilot = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required." });
    }
    const reply = await aiService.chatCareerCopilot(messages);
    res.json({ reply });
  } catch (error) {
    console.error("AI Copilot Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to query Career Copilot." });
  }
};

// 4. Mock Interview Grading
exports.gradeInterview = async (req, res) => {
  try {
    const { roleType, topic, answers } = req.body;
    if (!roleType || !topic || !answers) {
      return res.status(400).json({ message: "roleType, topic, and answers are required." });
    }
    const grading = await aiService.conductMockInterview(roleType, topic, answers);
    res.json(grading);
  } catch (error) {
    console.error("AI Mock Interview Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to grade mock interview." });
  }
};

// 5. Custom Roadmap Generation
exports.createRoadmap = async (req, res) => {
  try {
    const { skills, targetCompany, weakAreas, goals } = req.body;
    const skillsList = Array.isArray(skills) ? skills : [skills];
    
    const roadmap = await aiService.generateLearningRoadmap(
      skillsList,
      targetCompany || "Any Tech Company",
      weakAreas || "General frontend/backend",
      goals || "Build portfolio projects"
    );
    
    res.json({ roadmap });
  } catch (error) {
    console.error("AI Roadmap Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate roadmap." });
  }
};
