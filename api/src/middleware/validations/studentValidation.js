const Joi = require('joi');

const createStudentSchema = Joi.object({
  // Users table fields
  email: Joi.string().email().max(100).required().messages({
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 100 characters',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().max(255).required().messages({
    'string.max': 'Password must not exceed 255 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('student').required().messages({
    'any.only': 'Role must be "student" for student creation',
    'any.required': 'Role is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active').messages({
    'any.only': 'Status must be one of: active, inactive'
  }),
  last_login: Joi.date().optional().allow(null),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional().allow(null),

  // User_profiles table fields
  first_name: Joi.string().max(50).required().messages({
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().max(50).required().messages({
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional().allow(null),
  birthdate: Joi.date().optional().allow(null),
  phone: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Phone number must not exceed 20 characters'
  }),
  address: Joi.string().optional().allow(null),
  profile_image: Joi.string().allow(null),
  telegram_id: Joi.string().max(100).optional().allow(null).messages({
    'string.max': 'Telegram ID must not exceed 100 characters'
  }),


  academic_year_id: Joi.number().integer().positive().required(),
  parent_contact: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Parent contact must not exceed 20 characters'
  }),
  emergency_contact: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Emergency contact must not exceed 20 characters'
  })
});
const updateStudentSchema = Joi.object({
  // Users table fields
  email: Joi.string().email().max(100).required().messages({
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 100 characters',
    'any.required': 'Email is required'
  }),
  

  role: Joi.string().valid('student').required().messages({
    'any.only': 'Role must be "student" for student creation',
    'any.required': 'Role is required'
  }),
  status: Joi.string().valid('active', 'inactive').default('active').messages({
    'any.only': 'Status must be one of: active, inactive'
  }),
 

  // User_profiles table fields
  first_name: Joi.string().max(50).required().messages({
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().max(50).required().messages({
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  updated_at: Joi.date().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional().allow(null),
  birthdate: Joi.date().optional().allow(null),
  phone: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Phone number must not exceed 20 characters'
  }),
  address: Joi.string().optional().allow(null),
  profile_image: Joi.string().allow(null),
  telegram_id: Joi.string().max(100).optional().allow(null).messages({
    'string.max': 'Telegram ID must not exceed 100 characters'
  }),


  academic_year_id: Joi.number().integer().positive().optional().allow(null),
  parent_contact: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Parent contact must not exceed 20 characters'
  }),
  emergency_contact: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Emergency contact must not exceed 20 characters'
  })
});

module.exports = {createStudentSchema , updateStudentSchema};