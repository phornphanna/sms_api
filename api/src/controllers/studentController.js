const studentModel = require('../models/studentModel');
const responseStudent = require('../helper/response/responseStudent');
const { createStudentSchema, updateStudentSchema } = require('../middleware/validations/studentValidation');
const fs = require('fs/promises');
const logError = require('../utils/logger');
const path = require('path');


class StudentController {
    async createStudent(req, res) {

        try {
            const { error } = createStudentSchema.validate(req.body);
            if (error) {

                return responseStudent.responseError(res, error.details[0].message);
            }


            if (!req.file) {
                return responseStudent.responseError(res, "Invalid file type or no file uploaded");
            }


            const result = await studentModel.create(req.body, req.file);
            if (result.affectedRows > 0) {
                return responseStudent.responseSuccess(res, 'Student created successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async getAllStudents(req, res) {
        try {
            const { search, academicYearId, sortBy, sortOrder, page, limit } = req.query;
            const result = await studentModel.getAll({ search, academicYearId, sortBy, sortOrder, page, limit });
            return responseStudent.responseSuccess(res, result, 'Students fetched successfully');
        } catch (error) {
            return responseStudent.responseError(res, error);
        }
    }

    async updateStudent(req, res) {
        try {
            const { error } = updateStudentSchema.validate(req.body);
            if (error) {
                return responseStudent.responseError(res, error.details[0].message);
            }


            if (!req.file) {
                return responseStudent.responseError(res, "Invalid file type or no file uploaded");
            }
            const isStudent = await studentModel.getById(req.params.id);
            if (!isStudent) {
                return responseStudent.responseError(res, "Student not found");
            }

            let currentFile = isStudent.profile_image;

            if (req.file) {

                if (currentFile != 'no-img.jpg') {
                    const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                    console.log(imagePath)
                    fs.unlink(imagePath);
                }
                currentFile = req.file.filename;
            }

         


            const result = await studentModel.update(req.params.id, req.body, currentFile);

            if (result.affectedRows > 0) {
                return responseStudent.responseSuccess(res, 'Student updated successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async deleteStudent(req, res) {
        try {
            const result = await studentModel.delete(req.params.id);
            if (result.affectedRows > 0) {
                return responseStudent.responseSuccess(res, 'Student deleted successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async getStudentById(req, res) {
        try {
            const result = await studentModel.getById(req.params.id);
            if (result.length == 0) {
                return responseStudent.responseError(res, 'Student not found');
            }
            return responseStudent.responseSuccess(res, result, 'Student fetched successfully');
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async deleteProfileImage(req, res) {
        try {
            const isStudent = await studentModel.getById(req.params.id);
            if (!isStudent) {
                return responseStudent.responseError(res, 'Student not found');
            }
            let currentFile = isStudent.profile_image;
            const result = await studentModel.deleteProfileImage(req.params.id);
            if (result.affectedRows > 0) {
                fs.unlinkSync(currentFile);
                return responseStudent.responseSuccess(res, 'Profile image deleted successfully');
            }

        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

}

module.exports = new StudentController();


