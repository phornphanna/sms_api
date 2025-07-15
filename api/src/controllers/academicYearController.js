const academicYearModel = require('../models/academicYearModel');
const responseAcademicYear = require('../helper/response/responseAcademicYear');
const academicYearSchema = require('../middleware/validations/academicYearValidation');
const logError = require('../utils/logger');


class AcademicYearController {

    async createAcademicYear(req, res) {
        try {
            const { error } = academicYearSchema.validate(req.body);
            if (error) {
                responseAcademicYear.responseError(res, error.details[0].message);
            }
            const result = await academicYearModel.create(req.body);
             if(result.affectedRows > 0){
                responseAcademicYear.responseSuccess(res, 'Academic year created successfully');
             }
        } catch (error) {
            logError('academicYearController', error);
            responseAcademicYear.responseError(res, error.message);
        }
    }

    async getAllAcademicYears(req, res) {
        try {
            const result = await academicYearModel.getAll();
            responseAcademicYear.responseSuccess(res, result, 'Academic years fetched successfully');
        } catch (error) {
            logError('academicYearController', error);
            responseAcademicYear.responseError(res, error.message);
        }
    }

    async updateAcademicYear(req, res) {
        try {
            const { error } = academicYearSchema.validate(req.body);
            if (error) {
                responseAcademicYear.responseError(res, error.details[0].message);
            }
            const result = await academicYearModel.update(req.params.id, req.body);
            if(result.affectedRows > 0){
                responseAcademicYear.responseSuccess(res, 'Academic year updated successfully');
            }
        } catch (error) {
            logError('academicYearController', error);
            responseAcademicYear.responseError(res, error.message);
        }
    }

    async deleteAcademicYear(req, res) {
        try {
            const result = await academicYearModel.delete(req.params.id);
            if(result.affectedRows > 0){
                responseAcademicYear.responseSuccess(res, 'Academic year deleted successfully');
            }
        } catch (error) {
            logError('academicYearController', error);
            responseAcademicYear.responseError(res, error.message);
        }
    }

}

module.exports = new AcademicYearController();