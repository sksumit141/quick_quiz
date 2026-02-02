const asyncHandler = require('express-async-handler');
const Session = require('../models/Session');
const Quiz = require('../models/Quiz');
const generateRoomCode = require('../utils/roomCodeGenerator');


const createSession = asyncHandler(async (req, res) => {
    const { quizId } = req.body;

    if (!quizId) {
        res.status(400);
        throw new Error('Please provide quiz ID');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found');
    }

    let roomCode;
    let isUnique = false;

    while (!isUnique) {
        roomCode = generateRoomCode();
        const existingSession = await Session.findOne({ roomCode, isActive: true });
        if (!existingSession) {
            isUnique = true;
        }
    }

    const session = await Session.create({
        quizId,
        roomCode,
        isActive: true,
        currentQuestionIndex: 0,
        hasStarted: false
    });

    res.status(201).json(session);
});


const getSessionByRoomCode = asyncHandler(async (req, res) => {
    const session = await Session.findOne({
        roomCode: req.params.roomCode.toUpperCase(),
        isActive: true
    }).populate('quizId');

    if (!session) {
        res.status(404);
        throw new Error('Session not found or has ended');
    }

    res.json(session);
});


const endSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    session.isActive = false;
    session.endedAt = new Date();
    await session.save();

    res.json({ message: 'Session ended successfully' });
});


const updateCurrentQuestion = asyncHandler(async (req, res) => {
    const { questionIndex } = req.body;
    const session = await Session.findById(req.params.id).populate('quizId');

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    if (questionIndex < 0 || questionIndex >= session.quizId.questions.length) {
        res.status(400);
        throw new Error('Invalid question index');
    }

    session.currentQuestionIndex = questionIndex;
    session.hasStarted = true;
    await session.save();

    res.json(session);
});

module.exports = {
    createSession,
    getSessionByRoomCode,
    endSession,
    updateCurrentQuestion
};