const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createQuiz,
  getQuiz,
  getQuizzes,
  deleteQuiz,
  getQuizLeaderboard,
} = require("../controllers/quizController");

router.route("/").post(protect, createQuiz).get(protect, getQuizzes);

router.route("/:id").get(protect, getQuiz).delete(protect, deleteQuiz);
router.route("/:quizId/leaderboard").get(protect, getQuizLeaderboard);

module.exports = router;
