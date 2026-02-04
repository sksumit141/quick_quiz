const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Response = require('../models/Response');

// @desc    Generate and download PDF result
// @route   GET /api/pdf/student/:studentId
// @access  Public
const generateStudentPDF = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const session = await Session.findById(student.sessionId).populate('quizId');
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    const responses = await Response.find({ studentId: student._id });

    // Create PDF document
    const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="quiz_result_${student.rollNumber}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(24).text('Quiz Results', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Student Name: ${student.name}`);
    doc.text(`Roll Number: ${student.rollNumber}`);
    doc.text(`Quiz Title: ${session.quizId.title}`);
    doc.text(`Room Code: ${session.roomCode}`);
    doc.text(`Score: ${student.score}/${student.totalQuestions}`);
    doc.moveDown(2);

    // Add questions and answers
    doc.fontSize(16).text('Questions & Answers:', { underline: true });
    doc.moveDown();

    session.quizId.questions.forEach((question, index) => {
        const response = responses.find(r =>
            r.questionId.toString() === question._id.toString()
        );

        doc.fontSize(12).text(`Q${index + 1}: ${question.text}`);
        doc.moveDown(0.5);

        question.options.forEach((option, optIndex) => {
            let prefix = '○ ';
            if (optIndex === question.correctOption) {
                prefix = '✓ ';
            }
            if (response && optIndex === response.selectedOption) {
                prefix = optIndex === question.correctOption ? '✓ ' : '✗ ';
            }
            doc.text(`  ${prefix}${option}`);
        });

        doc.moveDown();

        if (response) {
            doc.fontSize(10).text(`Your answer: ${question.options[response.selectedOption]}`, {
                color: response.isCorrect ? 'green' : 'red'
            });
        } else {
            doc.fontSize(10).text('Not answered', { color: 'gray' });
        }
        doc.moveDown();
    });

    // Add summary
    doc.addPage();
    doc.fontSize(18).text('Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Total Questions: ${student.totalQuestions}`);
    doc.text(`Correct Answers: ${student.score}`);
    doc.text(`Score Percentage: ${((student.score / student.totalQuestions) * 100).toFixed(2)}%`);
    doc.moveDown();

    const date = new Date().toLocaleDateString();
    doc.fontSize(10).text(`Generated on: ${date}`, { align: 'right' });

    // Finalize PDF
    doc.end();
});

module.exports = {
    generateStudentPDF
};