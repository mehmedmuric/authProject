

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email is required!"],
        trim: true,
        unique: [true, "Email is already in use!"],
        lowercase: true,
        minLength: [5, "Email must be at least 5 characters!"],
        maxLength: [50, "Email must be at most 50 characters!"],
        match: [/.+@.+\..+/, "Email must be a valid email address!"]
    },

    password: {
        type: String,
        required: [true, "Password is required!"],
        trim: true,
        minLength: [6, "Password must be at least 6 characters!"],
        maxLength: [100, "Password must be at most 100 characters!"],
        select: false,
    },

    verified: {
        type: Boolean,
        default: false,
    },

    verificationCode: {
        type: String,
        select: false,

    },
    verificationCodeValidation: {
        type: String,
        select: false,
        
    },
    forgotPasswordCode: {
        type: String,
        select: false,
        
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
        
    }
}, {
    timestamps: true,

});

module.exports = mongoose.model("User", userSchema);