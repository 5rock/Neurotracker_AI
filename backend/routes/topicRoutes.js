const express = require('express');
const router = express.Router();
const {
  getTopics, addTopic, updateTopic, deleteTopic, studyTopic, getTodayTopics
} = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

router.use(protect); // All topic routes are protected

router.get('/today', getTodayTopics);
router.get('/', getTopics);
router.post('/', addTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);
router.post('/:id/study', studyTopic);

module.exports = router;
