const {signUpSchema, signInSchema, acceptCodeSchema, changePasswordSchema, acceptFPSchema} = require('../middlewares/validator');
const User = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const {mdoHash, doHashValidation, hmacProccess} = require('../utils/hashing');
const transport = require('../middlewares/sendMail');


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
};


exports.signOut = async (req, res) => {
    res.clearCoockie("Authorizaution").status(200).json({success: true, message: "User signed out successfully!"});



};


exports.sendVerificationCode = async (req, res) => {
    const {email} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(404).json({success: false, message: "User not found!"});
        }
        if(existingUser.verified){
            return res.status(400).json({success: false, message: "User already verified!"});
        }
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Verification Code",
            html: `<h1> Your verification code is ${codeValue}</h1>`,
        })
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProccess(codeValue, process.env.HMAC_VERIFICATION_CODE_KEY);
            existingUser.verifiedCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: "Verification code sent successfully!"});
        }
        res.status(500).json({success: false, message: "Failed to send verification code!"});
    } catch (err){
        console.log(err);
    }
};


exports.verifyVerificationCode = async (req, res) => {
    const {email, providedCode} = req.body;
    try{
        const {error, value} = acceptCodeSchema.validate({email, providedCode});
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message});
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({email}).select("+verifiedCode +verificationCodeValidation");
        if(!existingUser){
            return res.status(404).json({success: false, message: "User not found!"});
        }
        if(existingUser.verified){
            return res.status(400).json({success: false, message: "User already verified!"});
        }
        if(existingUser.verificationCode || !existingUser.verifiedCodeValidation){
            return res.status(400).json({success: false, message: "Verification code not found! Please request a new one!"});
        }

        if(Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000){
            return res.status(400).json({success: false, message: "Verification code expired! Please request a new one!"});
        }

        const hashedCodeValue = hmacProccess(codeValue, process.env.HMAC_VERIFICATION_CODE_KEY);
        if(hashedCodeValue === existingUser.verifiedCode){
            existingUser.verified = true;
            existingUser.verifiedCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({success: true, message: "User verified successfully!"});
        }

        return res.status(400).json({success: false, message: "Invalid verification code!"});

    } catch(err){
        console.log(err);
    }
};

exports.changePassword = async (req, res) => {
    const {userId, verified} = req.user;
    const {oldPassword, newPassword} = req.body;
      try{
        const {error, value} = changePasswordSchema.validate({oldPassword, newPassword});
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message});
        }
        if(!verified){
            return res.status(403).json({success: false, message: "User not verified!"});
        }

        const existingUser = await User.findOne({_id:userId}).select("+password");
        if(!existingUser){
            return res.status(404).json({success: false, message: "User not found!"});
        }

        const result = await doHashValidation(oldPassword, existingUser.password);
        if(!result){
            return res.status(401).json({success: false, message: "Invalid old password!"});
        }
        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();
        return res.status(200).json({success: true, message: "Password changed successfully!"});

      } catch (err){
          console.log(err);
      }
};


exports.sendForgotPasswordCode = async (req, res) => {
    const {email} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(404).json({success: false, message: "User not found!"});
        }

        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Forgot Password Code",
            html: `<h1> Your verification code is ${codeValue}</h1>`,
        })
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProccess(codeValue, process.env.HMAC_VERIFICATION_CODE_KEY);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: "Verification code sent successfully!"});
        }
        res.status(500).json({success: false, message: "Failed to send verification code!"});
    } catch (err){
        console.log(err);
    }
};


exports.verifyForgotPasswordCode = async (req, res) => {
   const {email, providedCode, newPassword} = req.body;
    try{
        const {error, value} = acceptFPSchema.validate({email, providedCode, newPassword});
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message});
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation");
        if(!existingUser){
            return res.status(404).json({success: false, message: "User not found!"});
        }
        if(existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
            return res.status(400).json({success: false, message: "Forgot password code not found! Please request a new one!"});
        }

        if(Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000){
            return res.status(400).json({success: false, message: "Forgot password code expired! Please request a new one!"});
        }

        const hashedCodeValue = hmacProccess(codeValue, process.env.HMAC_VERIFICATION_CODE_KEY);
        if(hashedCodeValue === existingUser.forgotPasswordCode){
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({success: true, message: "Password reset successfully!"});
        }

        return res.status(400).json({success: false, message: "Invalid verification code!"});

    } catch(err){
        console.log(err);
    }
};