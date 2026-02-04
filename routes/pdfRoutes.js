const express = require('express');
const router = express.Router();
const { generateStudentPDF } = require('../controllers/pdfController');

router.route('/student/:studentId')
    .get(generateStudentPDF);

module.exports = router;