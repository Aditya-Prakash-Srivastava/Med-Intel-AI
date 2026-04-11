const express = require('express');
const router = express.Router();
const { getUserReports, createReport, updateReport, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware'); // Mandatory Authentication Guard

router.route('/')
  .get(protect, getUserReports)
  .post(protect, createReport);

router.route('/:id')
  .put(protect, updateReport)
  .delete(protect, deleteReport);

module.exports = router;
