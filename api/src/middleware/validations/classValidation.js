const Joi = require('joi');


const createClassSchema = Joi.object({
    course_id: Joi.number().required(),
    teacher_id: Joi.number().required(),
    max_students: Joi.number().required(),
    current_students: Joi.number().required(),
    status: Joi.string().required(),
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    created_by: Joi.number().required(),
    created_at: Joi.string().required(),
    time_slot: Joi.string().required(),
});

const updateClassSchema = Joi.object({
    course_id: Joi.number().required(),
    teacher_id: Joi.number().required(),
    max_students: Joi.number().required(),
    current_students: Joi.number().required(),
    status: Joi.string().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    created_by: Joi.number().required(),
    created_at: Joi.string().required(),
    time_slot: Joi.string().required(),
});

module.exports = {
    createClassSchema,
    updateClassSchema
}
