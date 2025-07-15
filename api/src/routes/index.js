const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const academicYearController = require('../controllers/academicYearController');
const uploadImage = require('../middleware/uploadImage');

// Student Routes
router.post('/students', uploadImage, studentController.createStudent);
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students/:id', uploadImage, studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);

// Academic Year Routes
router.post('/academic-years', academicYearController.createAcademicYear);
router.get('/academic-years', academicYearController.getAllAcademicYears);
router.put('/academic-years/:id', academicYearController.updateAcademicYear);
router.delete('/academic-years/:id', academicYearController.deleteAcademicYear);




module.exports = router;
