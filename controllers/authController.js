const {signUpSchema, signInSchema} = require('../middlewares/validator');
const User = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const {mdoHash, doHashValidation} = require('../utils/hashing');


exports.signUp = async (req, res) => {
    const {email, password} = req.body;
    try{
        const {error, value} = signUpSchema.validate({email, password});
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(401).json({success: false, message: "User already exists"});
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            password: hashedPassword,

        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({success: true, message: "User created successfully!", result});

    } catch(err){
        console.log(err);
    }
};


exports.signIn = async (req, res) => {
    const {email, password} = req.body;
    try{
        const {error, value} = signInSchema.validate({email,password});
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message});
        }
        const existingUser = await User.findOne({email}).select("+password");
        if(!existingUser){
            return res.status(401).json({success: false, message: "User not found!"});
        }
        const result = await doHashValidation(password, existingUser.password);
        if(!result){
            return res.status(401).json({success: false, message: "Invalid password!"});
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verfied: existingUser.verified,

        }, process.env.TOKEN_SECRET, {expiresIn: "8h"});
        res.coockie("Authorization", "Bearer" + token, {expires: new Date(Date.now() + 8 * 3600000), httpOnly: process.env.NODE_ENV === "production", secure: process.env.NODE_ENV === "production"}).json({
            success: true,
            token,
            message: "User signed in successfully!",
        })
    } catch(err){
        console.log(err);
    }
}