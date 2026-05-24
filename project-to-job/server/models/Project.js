const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: { type: String, required: true, trim: true },
    githubLink: { type: String, required: true },
    demoLink: { type: String, default: "" },
    videoLink: { type: String, default: "" },
    techStack: { type: [String], required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },

    // Proof Engine
    isVerified: { type: Boolean, default: false },
    proofScore: { type: Number, default: 0 },
    proofBreakdown: {
      githubDepth: { type: Number, default: 0 },
      commitConsistency: { type: Number, default: 0 },
      repoStructure: { type: Number, default: 0 },
      demoIntegrity: { type: Number, default: 0 },
      technicalExplanation: { type: Number, default: 0 }
    },

    // AI Authenticity Insights
    aiInsights: {
      ownershipVerified: { type: Boolean, default: false },
      commitQuality: { type: String, default: "" },
      repoMaturity: { type: String, default: "" },
      recommendation: { type: String, default: "" }
    },

    // GitHub snapshot at upload time
    githubStats: {
      stars: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      totalCommits: { type: Number, default: 0 },
      uniqueContributionDays: { type: Number, default: 0 },
      repoAgeInDays: { type: Number, default: 0 },
      language: { type: String, default: "" }
    },

    // Deprecated - keep for BC
    authenticityScore: { type: Number, default: 0 },

    // Engagement
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

projectSchema.index({ student: 1 });
projectSchema.index({ proofScore: -1 });
projectSchema.index({ techStack: 1 });

module.exports = mongoose.model("Project", projectSchema);