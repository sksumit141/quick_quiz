const express = require('express');
const router = express.Router();

const {
    createQuiz,
    getQuiz,
    getQuizzes
} = require('../controllers/quizController');

router.route('/').post(createQuiz).get(getQuizzes);

router.route('/:id').get(getQuiz);

module.exports = router;