const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  parsedText: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  atsScore: {
    type: Number,
    default: 0,
  },
  matchPercentage: {
    type: Number,
    default: 0,
  },
  matchingSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  suggestedImprovements: {
    type: [String],
    default: [],
  },
  keywordAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  roleSuitability: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
