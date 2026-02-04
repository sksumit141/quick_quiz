const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket/index');

const quizRoutes = require('./src/routes/quizRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const pdfRoutes = require('./src/routes/pdfRoutes');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});