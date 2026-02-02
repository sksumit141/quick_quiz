const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    hasStarted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;