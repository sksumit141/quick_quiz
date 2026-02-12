const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Response = require('../models/Response');


const registerStudent = asyncHandler(async (req, res) => {
    const { name, rollNumber, sessionCode } = req.body;

    if (!name || !rollNumber || !sessionCode) {
        res.status(400);
        throw new Error('Please provide name, roll number, and session code');
    }

    const session = await Session.findOne({
        roomCode: sessionCode.toUpperCase(),
        isActive: true
    });

    if (!session) {
        res.status(404);
        throw new Error('Invalid session code or session has ended');
    }

    const existingStudent = await Student.findOne({
        rollNumber,
        sessionCode: sessionCode.toUpperCase()
    });

    if (existingStudent) {
        // If student exists in this active session, return the existing student
        // This allows re-joining (e.g. after refresh or disconnect)
        return res.status(200).json(existingStudent);
    }

    const student = await Student.create({
        name,
        rollNumber,
        sessionCode: sessionCode.toUpperCase(),
        sessionId: session._id,
        totalQuestions: session.quizId?.questions?.length || 0
    });

    res.status(201).json(student);
});


const submitAnswer = asyncHandler(async (req, res) => {
    const { questionId, selectedOption, sessionId } = req.body;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const session = await Session.findById(sessionId).populate('quizId');
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    const question = session.quizId.questions.find(q =>
        q._id.toString() === questionId
    );

    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    const isCorrect = question.correctOption === selectedOption;

    const response = await Response.create({
        studentId,
        questionId,
        selectedOption,
        isCorrect,
        sessionId
    });


    if (isCorrect) {
        student.score += 1;
        await student.save();
    }

    res.json({
        response,
        isCorrect,
        correctOption: question.correctOption
    });
});


const getStudentResults = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const responses = await Response.find({ studentId: student._id })
        .populate({
            path: 'sessionId',
            populate: {
                path: 'quizId',
                model: 'Quiz'
            }
        });

    const session = await Session.findById(student.sessionId).populate('quizId');

    res.json({
        student,
        responses,
        quiz: session.quizId,
        session: session
    });
});


const getSessionLeaderboard = asyncHandler(async (req, res) => {
    const students = await Student.find({ sessionId: req.params.sessionId })
        .sort({ score: -1 })
        .select('name rollNumber score totalQuestions');

    res.json(students);
});

module.exports = {
    registerStudent,
    submitAnswer,
    getStudentResults,
    getSessionLeaderboard
};