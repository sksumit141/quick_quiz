const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');


const createQuiz = asyncHandler(async (req, res) => {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
        res.status(400);
        throw new Error('Please provide title and at last one question');
    }

    const quiz = await Quiz.create({
        title,
        questions
    });

    res.status(201).json(quiz);
});

const getQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(400);
        throw new Error('Quiz not found');
    }
    res.json(quiz);
});

const getQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
});

module.exports = {
    createQuiz,
    getQuiz,
    getQuizzes
};
