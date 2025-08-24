const TeacherModel = require('../models/teacherModel');
const teacherValidation = require('../middleware/validations/teacherValidation');
const logError = require('../utils/logger');
const responseTeacher = require('../helper/response/responseTeacher');
const fs = require('fs/promises');
const path = require('path');


class TeacherController {

    async create(req , res){
        
        try {
            const { error } = teacherValidation.createTeacherSchema.validate(req.body);
            if (error) {
                return responseTeacher.responseError(res, error.details[0].message);
            }
            const result = await TeacherModel.create(req.body);
            if (result) {
                return responseTeacher.responseSuccess(res, 'Teacher created successfully');
            }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }
    
    async getAll(req , res){
        try {
            const result = await TeacherModel.getAll();
            return res.send(result);
          if(result){
            return responseTeacher.responseSuccess(res, result, 'Teachers fetched successfully');
          }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }
    async update(req, res) {
        
        try {
            const { error } = teacherValidation.updateTeacherSchema.validate(req.body);
            if (error) {
                return responseTeacher.responseError(res, error.details[0].message);
            }
    
            const isTeacher = await TeacherModel.getById(req.params.id);
            if (!isTeacher) {
                return responseTeacher.responseError(res, 'Teacher not found');
            }
            
            const result = await TeacherModel.update(req.params.id, req.body);
          
            if (result) {
                return responseTeacher.responseSuccess(res, 'Teacher updated successfully');
            } else {
                return responseTeacher.responseError(res, 'Failed to update teacher');
            }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }
    

    async delete(req , res){
        try {
            const isTeacher = await TeacherModel.getById(req.params.id);
           
            if (!isTeacher) {
                return responseTeacher.responseError(res, "Teacher not found");
            }
            const filename = await TeacherModel.getImageById(req.params.id);
      
            let currentFile = filename.profile_image;

                    const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                    try {
                        await fs.unlink(imagePath);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.warn(`Could not delete old image: ${err.message}`);
                        }
                    }
            const result = await TeacherModel.delete(req.params.id);
            if (result) {
                return responseTeacher.responseSuccess(res, 'Teacher deleted successfully');
            }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }

    async updateImageProfile(req, res) {

        try {
            const isTeacher = await TeacherModel.getById(req.params.id);
           
            if (!isTeacher) {
                return responseTeacher.responseError(res, "Teacher not found");
            }
            const filename = await TeacherModel.getImageById(req.params.id);
          
            let currentFile = filename.profile_image;
            if (req.file) {
                
                if (currentFile != 'no-img.jpg') {
                    const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                    try {
                        await fs.unlink(imagePath);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.warn(`Could not delete old image: ${err.message}`);
                        }
                    }
                }
                currentFile = req.file.filename;
            }

           
            const result = await TeacherModel.updateImageProfile(req.params.id, currentFile);

            if (result) {
                return responseTeacher.responseSuccess(res, [], 'Profile image updated successfully');
            }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }

    async deleteProfileImage(req, res) {
        try {
            const isTeacher = await TeacherModel.getById(req.params.id);
            if (!isTeacher) {
                return responseTeacher.responseError(res, 'Teacher not found');
            }
            const filename = await TeacherModel.getImageById(req.params.id);
            let currentFile = filename.profile_image;
            const result = await TeacherModel.deleteProfileImage(req.params.id);
            if (result.affectedRows > 0) {
                const imagePath = path.join(__dirname, "../../uploads/", currentFile);

                try {
                    await fs.unlink(imagePath);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.warn(`Could not delete old image: ${err.message}`);
                    }
                }
                return responseTeacher.responseSuccess(res, 'Profile image deleted successfully');
            }
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }


    async getById(req , res){
        try {
            const result = await TeacherModel.getById(req.params.id);
            if (result.length == 0) {
                return responseTeacher.responseError(res, 'Teacher not found');
            }
            return responseTeacher.responseSuccess(res, result, 'Teacher fetched successfully');
        } catch (error) {
            logError('teacherController', error);
            return responseTeacher.responseError(res, error.message);
        }
    }
}

module.exports = new TeacherController();