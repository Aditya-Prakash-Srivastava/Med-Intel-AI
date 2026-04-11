const express = require('express');
const router = express.Router();
const { analyzeReport, chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeReport);
router.post('/chat', protect, chatWithAI);

module.exports = router;
