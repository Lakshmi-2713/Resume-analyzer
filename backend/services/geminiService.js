const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini SDK
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate vector embedding for a given text using gemini-embedding-2 model
 */
const generateEmbedding = async (text) => {
  try {
    const genAI = getGenAI();
    if (!genAI) throw new Error('Gemini API key is not configured.');

    // Use the stable embedding model compatible with the current API version
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
    const result = await model.embedContent(text);

    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    throw new Error('Invalid embedding response from Gemini API');
  } catch (error) {
    // If gemini-embedding-2 fails, fall back to gemini-embedding-001
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (fallbackError) {
      console.error('Fallback embedding also failed:', fallbackError.message);
      throw fallbackError;
    }
    console.error('Error generating embedding:', error.message);
    throw error;
  }
};

/**
 * Intelligent word-based text chunker with overlap
 */
const chunkText = (text, chunkSize = 1000, chunkOverlap = 200) => {
  if (!text) return [];

  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');
  const chunks = [];

  let currentChunkWords = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunkWords.push(word);
    currentLength += word.length + 1;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunkWords.join(' '));
      const overlapWordCount = Math.floor(currentChunkWords.length * (chunkOverlap / chunkSize));
      currentChunkWords = currentChunkWords.slice(-Math.max(1, overlapWordCount));
      currentLength = currentChunkWords.join(' ').length;
    }
  }

  if (currentChunkWords.length > 0) {
    chunks.push(currentChunkWords.join(' '));
  }

  return chunks;
};

/**
 * Get the best available generative model name
 */
const getGenerativeModelName = () => {
  return 'gemini-2.5-flash';
};

/**
 * Deep Analysis of Resume compared against Job Description
 */
const analyzeResumeAgainstJD = async (resumeText, jobDescription) => {
  try {
    const genAI = getGenAI();
    if (!genAI) throw new Error('Gemini API key is not configured.');

    const model = genAI.getGenerativeModel({
      model: getGenerativeModelName(),
    });

    const defaultJD = 'General evaluation of the resume ATS compliance, formatting, skills, and suitability for standard tech roles.';
    const targetJD = jobDescription && jobDescription.trim() !== '' ? jobDescription : defaultJD;

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and senior recruiter.
Analyze the following candidate resume against the provided Job Description.

CANDIDATE RESUME:
${resumeText.substring(0, 8000)}

TARGET JOB DESCRIPTION:
${targetJD.substring(0, 3000)}

Respond ONLY with a valid JSON object (no markdown, no backticks, no explanation outside JSON):
{
  "summary": "A 2-3 sentence professional summary of the candidate.",
  "atsScore": 75,
  "matchPercentage": 70,
  "matchingSkills": ["Skill1", "Skill2"],
  "missingSkills": ["MissingSkill1", "MissingSkill2"],
  "suggestedImprovements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "keywordAnalysis": { "KeywordA": 3, "KeywordB": 0 },
  "roleSuitability": "Brief 2-sentence suitability assessment."
}
`;

    const response = await model.generateContent(prompt);
    let responseText = response.response.text().trim();

    // Strip markdown code blocks if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error.message);
    return {
      summary: 'Unable to generate summary. Check your Gemini API key and quota.',
      atsScore: 50,
      matchPercentage: 50,
      matchingSkills: [],
      missingSkills: ['API connection failed — check GEMINI_API_KEY'],
      suggestedImprovements: ['Verify your GEMINI_API_KEY in backend/.env is valid and has quota remaining.'],
      keywordAnalysis: {},
      roleSuitability: 'Analysis unavailable due to API error.'
    };
  }
};

/**
 * Generate answer using RAG context
 */
const generateRAGResponse = async (question, resumeContext, chatHistory = []) => {
  try {
    const genAI = getGenAI();
    if (!genAI) throw new Error('Gemini API key is not configured.');

    const model = genAI.getGenerativeModel({ model: getGenerativeModelName() });

    const formattedHistory = chatHistory
      .slice(-6)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are an empathetic Career Coach and Technical Recruiter helping a candidate improve their resume.

RESUME CONTEXT:
${resumeContext}

RECENT CHAT HISTORY:
${formattedHistory}

Based on the resume context, answer the user's question professionally and concisely. If the answer isn't in the resume, say so and offer a general recommendation.

USER QUESTION: ${question}
`;

    const response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('Error generating RAG response:', error.message);
    return 'I encountered an error communicating with the AI. Please check that your Gemini API key is valid and has available quota.';
  }
};

module.exports = {
  generateEmbedding,
  chunkText,
  analyzeResumeAgainstJD,
  generateRAGResponse
};
