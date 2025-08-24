const ClassModel = require('../models/classModel');
const classValidation = require('../middleware/validations/classValidation');
const TeacherModel = require('../models/teacherModel');
const CourseModel = require('../models/courseModel');
const responseClass = require('../helper/response/responseClass');
const logError = require('../utils/logger');
const path = require('path');
const fs = require('fs/promises');

class ClassController {

      async create(req, res) {
            let currentFile = req.file.filename;
            try {
                  const { error } = classValidation.createClassSchema.validate(req.body);
                  if (error) {
                        return responseClass.responseError(res, error.details[0].message);
                  }

                  const isTeacher = await TeacherModel.getById(req.body.teacher_id);
                  if (isTeacher.length == 0) {
                        const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                        try {
                              await fs.access(imagePath, fs.constants.F_OK);
                              await fs.unlink(imagePath);
                        } catch (err) {
                              if (err.code !== 'ENOENT') {
                                    console.warn(`Could not delete old image: ${err.message}`);
                              }
                        }
                        return responseClass.responseError(res, 'Teacher not found');
                  }
                  const isCourse = await CourseModel.getById(req.body.course_id);
                  if (isCourse.length == 0) {
                        const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                        try {
                              await fs.access(imagePath, fs.constants.F_OK);
                              await fs.unlink(imagePath);
                        } catch (err) {
                              if (err.code !== 'ENOENT') {
                                    console.warn(`Could not delete old image: ${err.message}`);
                              }
                        }
                        return responseClass.responseError(res, 'Course not found');
                  }

                  req.body.image_class = 'no-img.jpg';
                  if (req.file) {
                        req.body.image_class = req.file.filename;
                  }

                  const result = await ClassModel.create(req.body);

                  if (!result.ok) {

                        const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                        try {
                              await fs.access(imagePath, fs.constants.F_OK);
                              await fs.unlink(imagePath);
                        } catch (err) {
                              if (err.code !== 'ENOENT') {
                                    console.warn(`Could not delete old image: ${err.message}`);
                              }
                        }
                        return responseClass.responseError(res, result.message);
                  }

                  return responseClass.responseSuccess(res, 'Class created successfully');
            } catch (error) {
                  const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                  try {
                        await fs.access(imagePath, fs.constants.F_OK);
                        await fs.unlink(imagePath);
                  } catch (err) {
                        if (err.code !== 'ENOENT') {
                              console.warn(`Could not delete old image: ${err.message}`);
                        }
                  }
                  logError('classController', error);
                  return responseClass.responseError(res, error.message);
            }
      }


      async getAll(req, res) {
            try {
               

                  const result = await ClassModel.getAll();
                  if (result) {
                        return responseClass.responseSuccess(res, 'Class fetched successfully', result);
                  }
            } catch (error) {
                  logError('classController', error);
                  return responseClass.responseError(res, error.message);
            }
      }

      async update(req, res) {
            try {
                   
                  const isTeacher = await TeacherModel.getById(req.body.teacher_id);
                  if (isTeacher.length == 0) {
                        const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                        try {
                              await fs.access(imagePath, fs.constants.F_OK);
                              await fs.unlink(imagePath);
                        } catch (err) {
                              if (err.code !== 'ENOENT') {
                                    console.warn(`Could not delete old image: ${err.message}`);
                              }
                        }
                        return responseClass.responseError(res, 'Teacher not found');
                  }
                  const isCourse = await CourseModel.getById(req.body.course_id);
                  if (isCourse.length == 0) {
                        const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                        try {
                              await fs.access(imagePath, fs.constants.F_OK);
                              await fs.unlink(imagePath);
                        } catch (err) {
                              if (err.code !== 'ENOENT') {
                                    console.warn(`Could not delete old image: ${err.message}`);
                              }
                        }
                        return responseClass.responseError(res, 'Course not found');
                  }
                  const { error } = classValidation.updateClassSchema.validate(req.body);
                  if (error) {
                        return responseClass.responseError(res, error.details[0].message);
                  }
                  const result = await ClassModel.update(req.params.id, req.body);
                  if (!result.ok) {
                        return responseClass.responseError(res, 'Class not found');
                  }
                  return responseClass.responseSuccess(res, 'Class updated successfully', result);
            } catch (error) {
                  logError('classController', error);
                  return responseClass.responseError(res, error.message);
            }
      }

}

module.exports = new ClassController();