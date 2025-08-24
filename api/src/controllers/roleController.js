const RoleModel = require('../models/roleModel');
const roleValidation = require('../middleware/validations/roleValidation');
const logError = require('../utils/logger');
const responseRole = require('../helper/response/responseRole');


class RoleController {
     async create(req , res){
         try {
            const { error, value } = roleValidation.validate(req.body);
            if (error) {
                return responseRole.responseError(res, error.details[0].message);
            }
            const result = await RoleModel.create(value);
            return responseRole.responseSuccess(res, [] , 'Role created successfully');
         } catch (error) {
             logError(error);
             return responseRole.responseError(res , error.message);
         }
     }

     async getAll(req , res){
         try {
            const result = await RoleModel.getAll();
            return responseRole.responseSuccess(res, result , 'Role fetched successfully');
         } catch (error) {
             logError(error);
             return responseRole.responseError(res, error.message);
         }
     }


    

     async update(req , res){
         try {
            const { error, value } = roleValidation.validate(req.body);
            if (error) {
                return responseRole.responseError(res, error.details[0].message);
            }
            const isRole = await RoleModel.getById(req.params.id);
            if (isRole.length == 0) {
                return responseRole.responseError(res, 'Role not found');
            }
            const result = await RoleModel.update(req.params.id, value);
            return responseRole.responseSuccess(res, [] , 'Role updated successfully');
         } catch (error) {
             logError(error);
             return responseRole.responseError(res, error.message);
         }
     }

     async delete(req , res){
         try {
            const isRole = await RoleModel.getById(req.params.id);
            if (isRole.length == 0) {
                return responseRole.responseError(res, 'Role not found');
            }
            const result = await RoleModel.delete(req.params.id);
            return responseRole.responseSuccess(res, [] , 'Role deleted successfully');
         } catch (error) {
             logError(error);
             return responseRole.responseError(res, error.message);
         }
     }
}
module.exports = new RoleController();