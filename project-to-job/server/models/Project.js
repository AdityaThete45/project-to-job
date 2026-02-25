const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    githubLink: {
      type: String,
      required: true
    },
    demoLink: {
      type: String,
      default: ""
    },
    videoLink: {
      type: String,
      default: ""
    },
    techStack: {
      type: [String],
      required: true
    },
    role: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    isVerified: {
  type: Boolean,
  default: false
},

    // OLD FIELD (keep but unused now)
    authenticityScore: {
      type: Number,
      default: 0
    },

    // 🔥 PHASE 2.0 ENGINE
    proofScore: {
      type: Number,
      default: 0
    },
    proofBreakdown: {
  githubDepth: { type: Number, default: 0 },
  commitConsistency: { type: Number, default: 0 },
  repoStructure: { type: Number, default: 0 },
  demoIntegrity: { type: Number, default: 0 },
  technicalExplanation: { type: Number, default: 0 }
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);