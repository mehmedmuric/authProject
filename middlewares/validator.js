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
});

exports.acceptCodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com', 'net']}
    }),
    providedCode: Joi.number().required(),
});

exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(6).max(150).required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    newPassword: Joi.string().min(6).max(150).required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
});

exports.acceptFPSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com', 'net']}
    }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string().min(6).max(150).required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
});

exports.createPostSchema = Joi.object({
    title: Joi.string().min(6).max(60).required(),
    description: Joi.string().min(6).max(600).required(),
    userId: Joi.string().required(),
});