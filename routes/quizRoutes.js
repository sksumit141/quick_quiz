const express = require('express');
const router = express.Router();

const {
    createQuiz,
    getQuiz,
    getQuizzes,
    deleteQuiz
} = require('../controllers/quizController');

router.route('/').post(createQuiz).get(getQuizzes);


router.route('/:id').get(getQuiz).delete(deleteQuiz);

module.exports = router;