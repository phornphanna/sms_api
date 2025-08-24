const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const academicYearController = require('../controllers/academicYearController');
const teacherPositionController = require('../controllers/teacherPositionController');
const categoryController = require('../controllers/categoryController');
const roleController = require('../controllers/roleController');
const adminController = require('../controllers/adminController');
const teacherController = require('../controllers/teacherController');
const courseController = require('../controllers/courseController');
const classController = require('../controllers/classController');
const uploadImage = require('../middleware/uploadImage');

// Student Routes
router.post('/students',  studentController.create);
router.get('/students', studentController.getAll);
router.get('/students/:id', studentController.getById);
router.put('/students/:id', studentController.update);
router.delete('/students/:id', studentController.delete);
router.put('/students/profile-image/:id', studentController.deleteProfileImage);
router.post('/students/profile-image/:id', uploadImage , studentController.updateImageProfile);

// Academic Year Routes
router.post('/academic-years', academicYearController.create);
router.get('/academic-years', academicYearController.getAll);
router.put('/academic-years/:id', academicYearController.update);
router.delete('/academic-years/:id', academicYearController.delete);

// position teacher route
router.post('/teacher-position', teacherPositionController.create);
router.get('/teacher-position', teacherPositionController.getAll);
router.put('/teacher-position/:id', teacherPositionController.update);
router.delete('/teacher-position/:id', teacherPositionController.delete);

// category route
router.post('/category', categoryController.create);
router.get('/category', categoryController.getAll);
router.put('/category/:id', categoryController.update);
router.delete('/category/:id', categoryController.delete);

// role route
router.post('/role', roleController.create);
router.get('/role', roleController.getAll);
router.put('/role/:id', roleController.update);
router.delete('/role/:id', roleController.delete);

// admin route
router.post('/admins', adminController.create);
router.get('/admins', adminController.getAll);
router.put('/admins/:id', adminController.update);
router.delete('/admins/:id', adminController.delete);
router.get('/admins/:id', adminController.getById);
router.put('/admins/profile-image/:id' , adminController.deleteProfileImage);
router.post('/admins/profile-image/:id' , uploadImage , adminController.updateImageProfile);

// teacher route
router.post('/teacher', teacherController.create);
router.get('/teacher', teacherController.getAll);
router.put('/teacher/:id', teacherController.update);
router.delete('/teacher/:id', teacherController.delete);
router.get('/teacher/:id', teacherController.getById);
router.post('/teacher/profile-image/:id', uploadImage , teacherController.updateImageProfile);
router.put('/teacher/profile-image/:id', teacherController.deleteProfileImage);

// course route 
router.post('/course', uploadImage ,  courseController.create);
router.get('/course', courseController.getAll);
router.put('/course/:id', courseController.update);
router.delete('/course/:id', courseController.delete);
router.get('/course/:id', courseController.getById);
router.post('/course/image/:id', uploadImage , courseController.updateImage);
router.put('/course/image/:id', courseController.deleteImage);

// class router 
router.post('/class', uploadImage ,  classController.create);
router.get('/class', classController.getAll);    
router.put('/class/:id', classController.update);
// router.delete('/class/:id', classController.delete);
// router.get('/class/:id', classController.getById);
// router.post('/class/image/:id', uploadImage , classController.updateImage);
// router.put('/class/image/:id', classController.deleteImage);

    





module.exports = router;
