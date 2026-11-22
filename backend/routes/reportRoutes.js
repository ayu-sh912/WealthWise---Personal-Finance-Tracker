const express = require('express');
const { getSummary, getMonthly, getCategoryBreakdown, getTrends } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/category', getCategoryBreakdown);
router.get('/trends', getTrends);

module.exports = router;
