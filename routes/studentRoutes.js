const express = require('express');
const router = express.Router();
const {
    registerStudent,
    submitAnswer,
    getStudentResults,
    getSessionLeaderboard
} = require('../controllers/studentController');

router.route('/register')
    .post(registerStudent);

router.route('/:id/answer')
    .post(submitAnswer);

router.route('/:id/results')
    .get(getStudentResults);

router.route('/session/:sessionId/leaderboard')
    .get(getSessionLeaderboard);

module.exports = router;