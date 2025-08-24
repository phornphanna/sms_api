const studentModel = require('../models/studentModel');
const responseStudent = require('../helper/response/responseStudent');
const { createStudentSchema, updateStudentSchema } = require('../middleware/validations/studentValidation');
const academicYearModel = require('../models/academicYearModel');
const fs = require('fs/promises');
const logError = require('../utils/logger');
const path = require('path');


class StudentController {
    async create(req, res) {

        try {
            const { error } = createStudentSchema.validate(req.body);
            if (error) {
                return responseStudent.responseError(res, error.details[0].message);
            }
            const academicYear = await academicYearModel.getById(req.body.academic_year_id);
            if (!academicYear) {
                return responseStudent.responseError(res, "Academic year not found");
            }
            const result = await studentModel.create(req.body);
            if (result) {
                return responseStudent.responseSuccess(res, [], 'Student created successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async getAll(req, res) {
        try {
            const { search, academicYearId, sortBy, sortOrder, page, limit } = req.query;
            const result = await studentModel.getAll({ search, academicYearId, sortBy, sortOrder, page, limit });
            return responseStudent.responseSuccess(res, result, 'Students fetched successfully');
        } catch (error) {
            return responseStudent.responseError(res, error);
        }
    }

    async update(req, res) {
        try {
            const { error } = updateStudentSchema.validate(req.body);
            if (error) {
                return responseStudent.responseError(res, error.details[0].message);
            }

            const isStudent = await studentModel.getById(req.params.id);
            if (!isStudent) {
                return responseStudent.responseError(res, "Student not found");
            }
            const result = await studentModel.update(req.params.id, req.body);
            if (result.affectedRows > 0) {
                return responseStudent.responseSuccess(res, 'Student updated successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }


    async delete(req, res) {
        try {
            const isStudent = await studentModel.getById(req.params.id);
            if (!isStudent) {
                return responseStudent.responseError(res, "Student not found");
            }
            const filename = await studentModel.getImageById(req.params.id);
            let currentFile = filename.profile_image;
            if (req.file) {
                if (currentFile !== 'no-img.jpg') {
                    const imagePath = path.join(__dirname, "../../uploads/", currentFile);

                    try {
                        await fs.access(imagePath, fs.constants.F_OK);
                        await fs.unlink(imagePath);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.warn(`Could not delete old image: ${err.message}`);
                        }
                    }
                }
                currentFile = req.file.filename;
            }
            const result = await studentModel.delete(req.params.id);
            if (result.affectedRows > 0) {
                return responseStudent.responseSuccess(res, 'Student deleted successfully');
            }
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }



    async getById(req, res) {
        try {
            const result = await studentModel.getById(req.params.id);
            if (!result) {
                return responseStudent.responseError(res, "Student not found");
            }
            return responseStudent.responseSuccess(res, result, 'Student fetched successfully');
        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

    async updateImageProfile(req, res) {

        try {
            const isStudent = await studentModel.getById(req.params.id);
            if (!isStudent) {
                return responseStudent.responseError(res, "Student not found");
            }
            const filename = await studentModel.getImageById(req.params.id);

            if (!filename) {
                return responseStudent.responseError(res, "Student not found");
            }
            let currentFile = filename.profile_image;
            if (req.file) {
                if (currentFile !== 'no-img.jpg') {
                    const imagePath = path.join(__dirname, "../../uploads/", currentFile);

                    try {
                        await fs.access(imagePath, fs.constants.F_OK);
                        await fs.unlink(imagePath);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.warn(`Could not delete old image: ${err.message}`);
                        }
                    }
                }
                currentFile = req.file.filename;
            }
            const result = await studentModel.updateImageProfile(req.params.id, currentFile);

            if (result) {
                return responseStudent.responseSuccess(res, [], 'Student updated successfully');
            }
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
                const imagePath = path.join(__dirname, "../../uploads/", currentFile);

                try {
                    await fs.access(imagePath, fs.constants.F_OK);
                    await fs.unlink(imagePath);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.warn(`Could not delete old image: ${err.message}`);
                    }
                }
                return responseStudent.responseSuccess(res, 'Profile image deleted successfully');
            }

        } catch (error) {
            logError('studentController', error);
            return responseStudent.responseError(res, error.message);
        }
    }

}

module.exports = new StudentController();


