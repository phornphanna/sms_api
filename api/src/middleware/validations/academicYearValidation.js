const Joi  = require('joi');

const academicYearSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
});

module.exports = academicYearSchema;
