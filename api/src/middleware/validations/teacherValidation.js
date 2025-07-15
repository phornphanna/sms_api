const Joi = require('joi');

const createTeacherSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
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
    profile_image: Joi.string().required(),
    telegram_id: Joi.string().required(),
    position_id: Joi.number().integer().positive().required(),
    experiance_years: Joi.number().integer().positive().required(),
    specialization: Joi.string().required(),
    bio: Joi.string().required(),
    office_phone: Joi.string().required(),
    office_hour: Joi.string().required()
})

const updateTeacherSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    status: Joi.string().required(),
    updated_at: Joi.date().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    birthdate: Joi.date().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    profile_image: Joi.string().required(),
    telegram_id: Joi.string().required(),
    position_id: Joi.number().integer().positive().required(),
    experiance_years: Joi.number().integer().positive().required(),
    specialization: Joi.string().required(),
    bio: Joi.string().required(),
    office_phone: Joi.string().required(),
    office_hour: Joi.string().required()
})

module.exports = {
    createTeacherSchema,
    updateTeacherSchema
}
