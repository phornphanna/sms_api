const categoryModel = require('../models/categoryModel');
const responseCategory = require('../helper/response/responseCategory')
const categorySchema = require('../middleware/validations/categoryValidate');
const logError = require('../utils/logger');


class CategoryController {
    
    async create(req , res){
        try {
            const { error } = categorySchema.validate(req.body);
            if (error) {
                return responseCategory.responseError(res, error.details[0].message);
            }
            const result = await categoryModel.create(req.body);
            if (result) {
                return responseCategory.responseSuccess(res, result, 'Category created successfully');
            }
        } catch (error) {
            logError('categoryController', error);
            return responseCategory.responseError(res, error.message);
        }
    }

    async getAll(req , res){
        try {
            const result = await categoryModel.getAll();
            return responseCategory.responseSuccess(res, result, 'Categories fetched successfully');
        } catch (error) {
            logError('categoryController', error);
            return responseCategory.responseError(res, error.message);
        }
    }

    async update(req , res){
        try {
            const { error } = categorySchema.validate(req.body);
            if (error) {
                return responseCategory.responseError(res, error.details[0].message);
            }
            const isCategory = await categoryModel.getById(req.params.id);
            if (isCategory.length == 0) {
                return responseCategory.responseError(res, 'Category not found');
            }
            const result = await categoryModel.update(req.params.id, req.body);
            if (result) {
                return responseCategory.responseSuccess(res, [], 'Category updated successfully');
            }
        } catch (error) {
            logError('categoryController', error);
            return responseCategory.responseError(res, error.message);
        }
    }

    async delete(req , res){
        try {
            const isCategory = await categoryModel.getById(req.params.id);
            if (isCategory.length == 0) {
                return responseCategory.responseError(res, 'Category not found');
            }
            const result = await categoryModel.delete(req.params.id);
            if (result) {
                return responseCategory.responseSuccess(res, [], 'Category deleted successfully');
            }
        } catch (error) {
            logError('categoryController', error);
            return responseCategory.responseError(res, error.message);
        }
    }

}
module.exports  = new CategoryController();