const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createSession,
  getSessionByRoomCode,
  getActiveSessions,
  endSession,
  updateCurrentQuestion,
  
} = require("../controllers/sessionController");

router.route("/").post(protect, createSession).get(protect, getActiveSessions);

router.route("/room/:roomCode").get(getSessionByRoomCode);

router.route("/:id/end").put(protect, endSession);

router.route("/:id/question").put(protect, updateCurrentQuestion);


module.exports = router;
