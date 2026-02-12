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
    // If user is authenticated, find their quizzes. But we don't have user on quiz model yet?
    // Wait, User model exists. Quiz model might not have user ref. Let's check Quiz model.
    res.json(await Quiz.find().sort({ createdAt: -1 })); // Placeholder
});

const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    await Quiz.deleteOne({ _id: req.params.id });

    res.json({ id: req.params.id });
});

module.exports = {
    createQuiz,
    getQuiz,
    getQuizzes,
    deleteQuiz
};
