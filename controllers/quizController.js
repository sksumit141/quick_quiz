const asyncHandler = require("express-async-handler");
const Quiz = require("../models/Quiz");
const Session = require("../models/Session");

const createQuiz = asyncHandler(async (req, res) => {
  const { title, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
    res.status(400);
    throw new Error("Please provide title and at last one question");
  }

  const quiz = await Quiz.create({
    title,
    questions,
  });

  res.status(201).json(quiz);
});

const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(400);
    throw new Error("Quiz not found");
  }
  res.json(quiz);
});

// const getQuizzes = asyncHandler(async (req, res) => {
//   // If user is authenticated, find their quizzes. But we don't have user on quiz model yet?
//   // Wait, User model exists. Quiz model might not have user ref. Let's check Quiz model.
//   res.json(await Quiz.find().sort({ createdAt: -1 })); // Placeholder
// });

const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();

  const quizzesWithStats = await Promise.all(
    quizzes.map(async (quiz) => {
      const sessions = await Session.find({
        quizId: quiz._id,
        hostId: req.user._id,
        isActive: false,
      }).select("finalLeaderboard");

      let totalScore = 0;
      let totalStudents = 0;

      sessions.forEach((session) => {
        (session.finalLeaderboard || []).forEach((student) => {
          totalScore += student.score || 0;
          totalStudents += 1;
        });
      });

      const avgScore =
        totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : "N/A";

      return {
        ...quiz,
        avgScore,
      };
    }),
  );

  res.json(quizzesWithStats);
});
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  await Quiz.deleteOne({ _id: req.params.id });

  res.json({ id: req.params.id });
});
const getQuizLeaderboard = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const sessions = await Session.find({
    quizId: req.params.quizId,
    hostId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .select("roomCode isActive createdAt endedAt finalLeaderboard");

  res.json({
    quizId: quiz._id,
    quizTitle: quiz.title,
    sessions,
  });
});

module.exports = {
  createQuiz,
  getQuiz,
  getQuizzes,
  deleteQuiz,
  getQuizLeaderboard,
};
