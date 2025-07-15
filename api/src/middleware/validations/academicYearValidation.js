const Joi  = require('joi');

const academicYearSchema = Joi.object({
    name: Joi.string().required(),
});

module.exports = academicYearSchema;
