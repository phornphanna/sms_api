const Joi = require('joi');

const createTeacherSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    status: Joi.string().required(),
    last_login: Joi.date().required(),
    created_at: Joi.date().required(),
    updated_at: Joi.date().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    birthdate: Joi.date().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    telegram_id: Joi.string().required(),
    position_id: Joi.number().integer().positive().required(),
    experience_years: Joi.string().required(),
    specialization: Joi.string().required(),
    bio: Joi.string().required(),
    office_location: Joi.string().required(),
    office_hours: Joi.string().required()
})

const updateTeacherSchema = Joi.object({
    email: Joi.string().email().required(),
    status: Joi.string().required(),
    updated_at: Joi.date().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    birthdate: Joi.date().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    telegram_id: Joi.string().required(),
    position_id: Joi.number().integer().positive().required(),
    experience_years: Joi.string().required(),
    specialization: Joi.string().required(),
    bio: Joi.string().required(),
    office_location: Joi.string().required(),
    office_hours: Joi.string().required()
})

module.exports = {
    createTeacherSchema,
    updateTeacherSchema
}
