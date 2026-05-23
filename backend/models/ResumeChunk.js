const mongoose = require('mongoose');

const ResumeChunkSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for faster querying
ResumeChunkSchema.index({ resume: 1 });
ResumeChunkSchema.index({ user: 1 });

module.exports = mongoose.model('ResumeChunk', ResumeChunkSchema);
