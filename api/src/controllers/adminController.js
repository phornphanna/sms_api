const AdminModel = require('../models/adminModel');
const adminValidation = require('../middleware/validations/adminValidation');
const logError = require('../utils/logger');
const responseAdmin = require('../helper/response/responseAdmin');
const fs = require('fs/promises');
const path = require('path');

class AdminController {
  
    async create(req , res){
        try {
            const { error } = adminValidation.createAdminSchema.validate(req.body);
            if (error) {
                return responseAdmin.responseError(res, error.details[0].message);
            }
            const result = await AdminModel.create(req.body);
            if (result) {
                return responseAdmin.responseSuccess(res, 'Admin created successfully');
            }
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }
    
    async getAll(req , res){
        try {
            const result = await AdminModel.getAll();
            return responseAdmin.responseSuccess(res, result, 'Admins fetched successfully');
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }
    
    async update(req , res){
  
        try {
            const { error } = adminValidation.updateAdminSchema.validate(req.body);
            if (error) {
                return responseAdmin.responseError(res, error.details[0].message);
            }
            const isAdmin = await AdminModel.getById(req.params.id);
            if (isAdmin.length == 0) {
                return responseAdmin.responseError(res, 'Admin not found');
            }
           
            const result = await AdminModel.update(req.params.id, req.body);
            if (result) {
                return responseAdmin.responseSuccess(res , [] , 'Admin updated successfully');
            }
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }
    
    async delete(req , res){

        try {
            const isAdmin = await AdminModel.getById(req.params.id);
            if (isAdmin.length == 0) {
                return responseAdmin.responseError(res, 'Admin not found');
            }
            const filename = await AdminModel.getImageById(req.params.id);
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
            const result = await AdminModel.delete(req.params.id);
            if (result) {
                return responseAdmin.responseSuccess(res, 'Admin deleted successfully');
            }
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }
    
    async deleteProfileImage(req , res){
        try {
            const isAdmin = await AdminModel.getById(req.params.id);
            if (isAdmin.length == 0) {
                return responseAdmin.responseError(res, 'Admin not found');
            }
            const result = await AdminModel.deleteProfileImage(req.params.id);
            if (result) {
                return responseAdmin.responseSuccess(res, 'Admin profile image deleted successfully');
            }
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }

    async updateImageProfile(req , res){
        try {
            const isAdmin = await AdminModel.getById(req.params.id);
            if (isAdmin.length == 0) {
                return responseAdmin.responseError(res, 'Admin not found');
            }
                     const filename = await AdminModel.getImageById(req.params.id);
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
              
              const result = await AdminModel.updateImageProfile(req.params.id , req.body , currentFile);
            if (result) {
                return responseAdmin.responseSuccess(res, [] , 'Admin profile image updated successfully');
            }
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }

    async getById(req , res){
      
        try {
            const result = await AdminModel.getById(req.params.id);
            if (result.length == 0) {
                return responseAdmin.responseError(res, 'Admin not found');
            }
            return responseAdmin.responseSuccess(res, result, 'Admin fetched successfully');
        } catch (error) {
            logError('adminController', error);
            return responseAdmin.responseError(res, error.message);
        }
    }
    
}

module.exports = new AdminController();
