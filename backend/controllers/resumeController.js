const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const ResumeChunk = require('../models/ResumeChunk');
const geminiService = require('../services/geminiService');

// @desc    Upload, parse, chunk, embed and analyze resume PDF
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadAndAnalyze = async (req, res) => {
  try {
    // 1. Verify file exists
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume PDF file' });
    }

    const filePath = req.file.path;
    const jobDescription = req.body.jobDescription || '';

    // 2. Read and parse PDF
    let parsedText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      parsedText = pdfData.text;

      if (!parsedText || parsedText.trim() === '') {
        throw new Error('PDF parsed text is empty. Scanned documents are not supported.');
      }
    } catch (parseError) {
      console.error('PDF Parsing Error:', parseError.message);
      // Clean up uploaded file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Failed to parse PDF file: ${parseError.message}. Make sure the PDF is digitally created (not a scanned image).`
      });
    }

    // 3. Perform Gemini analysis
    console.log('Sending resume text to Gemini for structured analysis...');
    const analysis = await geminiService.analyzeResumeAgainstJD(parsedText, jobDescription);

    // 4. Save Resume Header in Database
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      parsedText: parsedText,
      jobDescription: jobDescription,
      summary: analysis.summary,
      atsScore: analysis.atsScore,
      matchPercentage: analysis.matchPercentage,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      suggestedImprovements: analysis.suggestedImprovements,
      keywordAnalysis: analysis.keywordAnalysis,
      roleSuitability: analysis.roleSuitability
    });

    // 5. Chunk and embed text for RAG search
    console.log('Generating chunks and vector embeddings...');
    const chunks = geminiService.chunkText(parsedText);
    const chunkPromises = chunks.map(async (chunkText, index) => {
      let embedding = [];
      try {
        embedding = await geminiService.generateEmbedding(chunkText);
      } catch (embError) {
        console.error(`Failed to generate embedding for chunk ${index}:`, embError.message);
        // Fallback: fill with empty array so DB schema doesn't crash
        embedding = new Array(768).fill(0);
      }

      return ResumeChunk.create({
        resume: resume._id,
        user: req.user._id,
        text: chunkText,
        embedding: embedding,
        chunkIndex: index
      });
    });

    await Promise.all(chunkPromises);

    // 6. Clean up the physical file to save space on server disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed and embedded successfully',
      data: resume
    });
  } catch (error) {
    console.error('Upload and Analyze Error:', error);
    // Attempt cleanup if file exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error parsing resume' });
  }
};

// @desc    Get user's upload analysis history
// @route   GET /api/resumes
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    console.error('Get History Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving upload history' });
  }
};

// @desc    Get detailed analysis for a specific resume
// @route   GET /api/resumes/:id
// @access  Private
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found' });
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error('Get Resume Detail Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving resume analysis' });
  }
};

// @desc    Delete a resume and all associated text chunks
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found' });
    }

    // Delete associated vector chunks
    await ResumeChunk.deleteMany({ resume: req.params.id });
    
    // Delete header record
    await resume.deleteOne();

    res.status(200).json({ success: true, message: 'Resume and vector database chunks removed successfully' });
  } catch (error) {
    console.error('Delete Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting resume' });
  }
};
