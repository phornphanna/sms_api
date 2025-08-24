const   Joi = require('joi');

const roleValidation = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
});

module.exports = roleValidation;