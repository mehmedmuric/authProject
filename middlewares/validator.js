const Joi = require('joi');

exports.signUpSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com', 'net']}
    }),
    password: Joi.string().min(6).max(150).required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
});

exports.signInSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com', 'net']}
    }),
    password: Joi.string().min(6).max(150).required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
})