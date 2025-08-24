const Joi = require('joi');

const categorySchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(null)
});



module.exports = categorySchema;
