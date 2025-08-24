const academicYearModel = require('../models/academicYearModel');
const responseAcademicYear = require('../helper/response/responseAcademicYear');
const academicYearSchema = require('../middleware/validations/academicYearValidation');
const logError = require('../utils/logger');


class AcademicYearController {

    async create(req, res) {
        try {
            const { error } = academicYearSchema.validate(req.body);
            if (error) {
                return     responseAcademicYear.responseError(res, error.details[0].message);
            }
            const result = await academicYearModel.create(req.body);
             if(result.affectedRows > 0){
                return     responseAcademicYear.responseSuccess(res, 'Academic year created successfully');
             }
        } catch (error) {
            logError('academicYearController', error);
           return  responseAcademicYear.responseError(res, error.message);
        }
    }

    async getAll(req, res) {
        try {
            const result = await academicYearModel.getAll();
            return   responseAcademicYear.responseSuccess(res, result, 'Academic years fetched successfully');
        } catch (error) {
            logError('academicYearController', error);
            return    responseAcademicYear.responseError(res, error.message);
        }
    }

    async update(req, res) {
        try {
            const { error } = academicYearSchema.validate(req.body);
            if (error) {
                return    responseAcademicYear.responseError(res, error.details[0].message);
            }
            const isAcademicYear = await academicYearModel.getById(req.params.id);
            if (isAcademicYear.length == 0) {
                return responseAcademicYear.responseError(res, 'Academic year not found');
            }
            const result = await academicYearModel.update(req.params.id, req.body);
            if(result.affectedRows > 0){
                return    responseAcademicYear.responseSuccess(res, 'Academic year updated successfully');
            }
        } catch (error) {
            logError('academicYearController', error);
            return   responseAcademicYear.responseError(res, error.message);
        }
    }

    async delete(req, res) {
        try {
            const isAcademicYear = await academicYearModel.getById(req.params.id);
            if (isAcademicYear.length == 0) {
                return responseAcademicYear.responseError(res, 'Academic year not found');
            }
            const result = await academicYearModel.delete(req.params.id);
          
            if(result){
                return responseAcademicYear.responseSuccess(res, 'Academic year deleted successfully');
            }
        } catch (error) {
            logError('academicYearController', error);
            return     responseAcademicYear.responseError(res, error.message);
        }
    }



}

module.exports = new AcademicYearController();