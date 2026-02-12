const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Response = require('../models/Response');

const generateStudentPDF = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const session = await Session.findById(student.sessionId).populate('quizId');
    const responses = await Response.find({ studentId: student._id });

    // Create PDF
    const doc = new PDFDocument();

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=result-${student.rollNumber}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text(`${session.quizId.title} - Results`, { align: 'center' });
    doc.moveDown();

    // Student Info
    doc.fontSize(12).text(`Name: ${student.name}`);
    doc.text(`Roll Number: ${student.rollNumber}`);
    doc.text(`Score: ${student.score} / ${session.quizId.questions.length}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Questions Breakdown
    session.quizId.questions.forEach((q, index) => {
        const response = responses.find(r => r.questionId.toString() === q._id.toString());
        const isCorrect = response ? response.isCorrect : false;
        const selectedOption = response ? q.options[response.selectedOption] : 'Not Answered';
        const correctOption = q.options[q.correctOption];

        doc.fontSize(12).font('Helvetica-Bold').text(`Q${index + 1}: ${q.text}`);
        doc.fontSize(10).font('Helvetica').text(`Your Answer: ${selectedOption}`, {
            color: isCorrect ? 'green' : 'red'
        });
        if (!isCorrect) {
            doc.text(`Correct Answer: ${correctOption}`, { color: 'green' });
        }
        doc.fillColor('black'); // Reset color
        doc.moveDown();
    });

    doc.end();
});

module.exports = { generateStudentPDF };