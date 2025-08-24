const Joi = require('joi');

const createteacherPositionSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
});

const updateTeacherPositionSchema  = Joi.object({
    name: Joi.string().required(),
});
module.exports =  {
   createteacherPositionSchema,
   updateTeacherPositionSchema
};
