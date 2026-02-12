const express = require('express');
const router = express.Router();

const {
    createSession,
    getSessionByRoomCode,
    getActiveSessions,
    endSession,
    updateCurrentQuestion
} = require('../controllers/sessionController');

router.route('/')
    .post(createSession)
    .get(getActiveSessions);

router.route('/room/:roomCode')
    .get(getSessionByRoomCode);

router.route('/:id/end')
    .put(endSession);

router.route('/:id/question')
    .put(updateCurrentQuestion);

module.exports = router;