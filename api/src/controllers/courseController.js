const CourseModel = require('../models/courseModel');
const courseValidation = require('../middleware/validations/courseValidation');
const responseCourse = require('../helper/response/responseCourse');
const fs  = require('fs/promises');
const path = require('path');
const logError = require('../utils/logger');

class CourseController {
    
    async create(req , res){
          try {
            const fileName = req.file.filename;
            req.body.image_url = fileName;
            
           const  {error}=  courseValidation.createCourseSchema.validate(req.body);
          
           if (error) {
             return { error: error.details[0].message };
           }
       
           const result = await CourseModel.create(req.body);
            
             if(result){
                return responseCourse.responseSuccess(res , result , 'Course created successfully');
             }

          }catch(error)
          {
             logError('courseController', error);
             return responseCourse.responseError(res , error.message);

          }
    }

    async getAll (req , res) {
          try {
            const result = await CourseModel.getAll();
            return responseCourse.responseSuccess(res , result , 'Course fetched successfully');
          }catch(error)
          {
             return responseCourse.responseError(res , error.message);
          }
    }

    async getById (req , res) {
          try {
            const result = await CourseModel.getById(req.params.id);
            return responseCourse.responseSuccess(res , result , 'Course fetched successfully');
          }catch(error)
          {
             return responseCourse.responseError(res , error.message);
          }
    }

    async update (req , res) {
          try {
            const isCourse = await CourseModel.getById(req.params.id);
            if (isCourse.length == 0) {
              return responseCourse.responseError(res, 'Course not found');
            }
       
            const { error} = courseValidation.updateCourseSchema.validate(req.body);
        
            if (error) {
              return { error: error.details[0].message };
            }
            
            const result = await CourseModel.update(req.params.id , req.body);
           
             if(result){
                return responseCourse.responseSuccess(res , [] , 'Course updated successfully');
             }
          }catch(error)
          {
             return responseCourse.responseError(res , error.message);
          }
    }

    async delete (req , res) {
          try {
            const isCourse = await CourseModel.getById(req.params.id);
            if (isCourse.length == 0) {
              return responseCourse.responseError(res, 'Course not found');
            }
            const filename = await CourseModel.getImageById(req.params.id);
                     let currentFile = filename.image_url;
                         if (currentFile !== 'no-img.jpg') {
                             const imagePath = path.join(__dirname, "../../uploads/", currentFile);
         
                             try {
                                 await fs.unlink(imagePath);
                             } catch (err) {
                                 if (err.code !== 'ENOENT') {
                                     console.warn(`Could not delete old image: ${err.message}`);
                                 }
                             }
                     }
                     
            const result = await CourseModel.delete(req.params.id);
              if(result){
                return responseCourse.responseSuccess(res , [] , 'Course deleted successfully');
              }
          }catch(error)
          {
             return responseCourse.responseError(res , error.message);
          }
    }

    async deleteImage(req , res) {
          try {
            const isCourse = await CourseModel.getById(req.params.id);
            if (isCourse.length == 0) {
              return responseCourse.responseError(res, 'Course not found');
            }
            const filename = await CourseModel.getImageById(req.params.id);
                     let currentFile = filename.image_url;
                   
                         if (currentFile !== 'no-img.jpg') {
                             const imagePath = path.join(__dirname, "../../uploads/", currentFile);
                             try {
                                 await fs.unlink(imagePath);
                             } catch (err) {
                                 if (err.code !== 'ENOENT') {
                                     console.warn(`Could not delete old image: ${err.message}`);
                                 }
                             }
                     }
            const result = await CourseModel.deleteImage(req.params.id);
              if(result){
                return responseCourse.responseSuccess(res , [] , 'Course image deleted successfully');
              }
          }catch(error)
          {
             return responseCourse.responseError(res , error.message);
          }
    }

    async updateImage (req , res) {
          try {
            const isCourse = await CourseModel.getById(req.params.id);
            if (isCourse.length == 0) {
              return responseCourse.responseError(res, 'Course not found');
            }
            const filename = await CourseModel.getImageById(req.params.id);

                    let currentFile = filename.image_url;
                    if(req.file){
                      if (currentFile !== 'no-img.jpg') {
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
            const result = await CourseModel.updateImage(req.params.id  , currentFile);
              if(result){
                return responseCourse.responseSuccess(res , [] , 'Course image updated successfully');
              }
          }catch(error) 
          {
             return responseCourse.responseError(res , error.message);
          }
    }

}
module.exports = new  CourseController();