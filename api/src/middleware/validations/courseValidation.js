const Joi  = require('joi');

const createCourseSchema = Joi.object({
      id: Joi.number().integer().positive().required(),
      name: Joi.string().required(),
      category_id: Joi.number().integer().positive().required(),
      description: Joi.string().required(),
      price: Joi.number().positive().required(),
      duration_weeks: Joi.number().integer().positive().required(),
      delivery_type: Joi.string().required(),
      image_url : Joi.string().required(),
      created_by: Joi.number().integer().positive().required(),
      created_at: Joi.date().required(),
})

const updateCourseSchema = Joi.object({
      name: Joi.string().required(),
      category_id: Joi.number().integer().positive().required(),
      description: Joi.string().required(),
      price: Joi.number().positive().required(),
      duration_weeks: Joi.number().integer().positive().required(),
      delivery_type: Joi.string().required()
})

module.exports = {
      createCourseSchema,
      updateCourseSchema
}