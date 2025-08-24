const TeacherPositionModel = require('../models/teacherPositionModel');
const { 
    createteacherPositionSchema,
    updateTeacherPositionSchema
 } = require('../middleware/validations/teacherPositionValidation');
const logError = require('../utils/logger');
const responseTeacherPosition = require('../helper/response/responseTeacherPosition');

class TeacherPositionController {
  
    async create(req , res){  
     
        try {
             const { error } = createteacherPositionSchema.validate(req.body);
             if (error) {
                 return responseTeacherPosition.responseError(res, error.details[0].message);
             }
             const result = await TeacherPositionModel.create(req.body);
             if (result) {
                 return responseTeacherPosition.responseSuccess(res, 'Teacher position created successfully');
             }
        } catch (error) {
            logError('teacherPositionController', error);
            return  responseTeacherPosition.responseError(res, error.message);
        }

    }

    async getAll(req , res){
         try {
              const result = await TeacherPositionModel.get();
              return responseTeacherPosition.responseSuccess(res, result, 'Teacher positions fetched successfully');
         }catch(error){
              logError('teacherPositionController', error);
              return responseTeacherPosition.responseError(res, error.message);
         }
    }

    async update(req , res){
         try {
              const { error } = updateTeacherPositionSchema.validate(req.body);
              if (error) {
                  return responseTeacherPosition.responseError(res, error.details[0].message);
              }
              const isTeacherPosition = await TeacherPositionModel.getById(req.params.id);
              if (isTeacherPosition.length == 0) {
                  return responseTeacherPosition.responseError(res, 'Teacher position not found');
              }
              const result = await TeacherPositionModel.update(req.params.id, req.body);
              if (result) {
                  return responseTeacherPosition.responseSuccess(res, 'Teacher position updated successfully');
              }
         }catch(error){
              logError('teacherPositionController', error);
              return responseTeacherPosition.responseError(res, error.message);
         }
    }

    async delete (req , res){
          try {
            const isTeacherPosition = await TeacherPositionModel.getById(req.params.id);
            if (isTeacherPosition.length == 0) {
                return responseTeacherPosition.responseError(res, 'Teacher position not found');
            }
             const result = await TeacherPositionModel.delete(req.params.id);
             if (result) {
                 return responseTeacherPosition.responseSuccess(res, 'Teacher position deleted successfully');
             }
          }catch(error){
               logError('teacherPositionController', error);
               return responseTeacherPosition.responseError(res, error.message);
          }
    }
    
}

module.exports = new TeacherPositionController;