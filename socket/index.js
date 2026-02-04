const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join-room', (roomCode) => {
            socket.join(roomCode);
            console.log(`Socket ${socket.id} joined room ${roomCode}`);

            socket.to(roomCode).emit('user-joined', { socketId: socket.id });
        });

        socket.on('start-quiz', (roomCode) => {
            io.to(roomCode).emit('quiz-started');
        });

        socket.on('send-question', ({ roomCode, question, questionIndex, totalQuestions }) => {
            io.to(roomCode).emit('new-question', {
                question,
                questionIndex,
                totalQuestions,
                timestamp: new Date()
            });
        });

        socket.on('submit-answer', ({ roomCode, studentId, questionId, selectedOption }) => {
            socket.to(roomCode).emit('answer-submitted', {
                studentId,
                questionId,
                timestamp: new Date()
            });
        });

        socket.on('update-results', ({ roomCode, leaderboard }) => {
            io.to(roomCode).emit('live-results', { leaderboard });
        });

        socket.on('end-quiz', (roomCode) => {
            io.to(roomCode).emit('quiz-ended');
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };