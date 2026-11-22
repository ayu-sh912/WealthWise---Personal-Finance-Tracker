const express = require('express');
const { getGoals, getGoal, createGoal, updateGoal, contributeToGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.route('/:id').get(getGoal).put(updateGoal).delete(deleteGoal);
router.post('/:id/contribute', contributeToGoal);

module.exports = router;
