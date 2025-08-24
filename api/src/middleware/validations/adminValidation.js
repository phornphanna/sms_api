const Joi = require('joi');

const createAdminSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    birthdate: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    telegram_id: Joi.string().required(),
    status: Joi.string().required(),
    last_login: Joi.string().required(),
    created_at: Joi.string().required(),
    updated_at: Joi.string().required(),
    admin_level: Joi.string().required(),
    responsibilities: Joi.string().required(),
});

const updateAdminSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    gender: Joi.string().required(),
    birthdate: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    status: Joi.string().required(),
    last_login: Joi.string().required(),
    created_at: Joi.string().required(),
    telegram_id: Joi.string().required(),
    updated_at: Joi.string().required(),
    admin_level: Joi.string().required(),
    responsibilities: Joi.string().required(),
});

module.exports  = {
    createAdminSchema,
    updateAdminSchema
}