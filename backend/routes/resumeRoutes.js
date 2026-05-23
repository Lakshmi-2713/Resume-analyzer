const express = require('express');
const router = express.Router();
const { uploadAndAnalyze, getHistory, getResumeById, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadAndAnalyze);
router.get('/', protect, getHistory);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

module.exports = router;
