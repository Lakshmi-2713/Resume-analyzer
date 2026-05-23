const ResumeChunk = require('../models/ResumeChunk');
const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');

// Helper: Vector Dot Product
const dotProduct = (a, b) => {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
};

// Helper: Vector Magnitude
const magnitude = (a) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
};

// Helper: Cosine Similarity
const cosineSimilarity = (a, b) => {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
};

// @desc    Ask questions about a resume (RAG)
// @route   POST /api/chat
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { resumeId, message, chatHistory } = req.body;

    // 1. Validation
    if (!resumeId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and message' });
    }

    // 2. Verify Resume Ownership
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found' });
    }

    // 3. Generate embedding for the user's query
    console.log(`Generating embedding for user chat message: "${message.substring(0, 40)}..."`);
    let queryEmbedding;
    try {
      queryEmbedding = await geminiService.generateEmbedding(message);
    } catch (embError) {
      console.error('Failed to generate embedding for query:', embError.message);
      // Fallback: search without RAG (simply send full resume summary + context to LLM)
      const fallbackResponse = await geminiService.generateRAGResponse(
        message, 
        `Candidate Summary: ${resume.summary}\nParsed Text Sample: ${resume.parsedText.substring(0, 3000)}`,
        chatHistory || []
      );
      return res.status(200).json({
        success: true,
        answer: fallbackResponse,
        citations: []
      });
    }

    // 4. Retrieve all chunks associated with this resume
    const chunks = await ResumeChunk.find({ resume: resumeId });
    if (!chunks || chunks.length === 0) {
      // Fallback if chunks are missing
      const fallbackResponse = await geminiService.generateRAGResponse(
        message,
        `Candidate Summary: ${resume.summary}`,
        chatHistory || []
      );
      return res.status(200).json({
        success: true,
        answer: fallbackResponse,
        citations: []
      });
    }

    // 5. Compute cosine similarities in JavaScript
    const scoredChunks = chunks.map((chunk) => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        similarity: similarity
      };
    });

    // 6. Sort and extract top K chunks (e.g. K = 4)
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    const topK = scoredChunks.slice(0, 4);

    // Filter out chunks that have extremely low similarity to avoid dilution
    const relevantChunks = topK.filter(chunk => chunk.similarity > 0.1);
    
    // Join chunks for LLM context
    const resumeContext = relevantChunks.length > 0
      ? relevantChunks.map(c => `[Chunk #${c.chunkIndex}]: ${c.text}`).join('\n\n')
      : `Candidate Summary: ${resume.summary}`;

    // 7. Ask Gemini with contextual prompt
    console.log(`Querying Gemini with ${relevantChunks.length} matching resume chunks as context...`);
    const answer = await geminiService.generateRAGResponse(message, resumeContext, chatHistory || []);

    // 8. Return response including citations (chunks utilized)
    res.status(200).json({
      success: true,
      answer,
      citations: relevantChunks.map(c => ({
        chunkIndex: c.chunkIndex,
        text: c.text,
        score: Math.round(c.similarity * 100) / 100
      }))
    });
  } catch (error) {
    console.error('Chat RAG Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing chatbot message' });
  }
};
