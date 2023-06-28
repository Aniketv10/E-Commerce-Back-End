const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors  = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

  

//Register  a User => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req,res,next) => {
    
    const { name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: 'userImg_jupvuu',
            url:'https://res.cloudinary.com/dxmimyaco/image/upload/v1679466867/userImg_jupvuu.jpg'
        }
    })

    sendToken(user, 200, res)


})



//Login User => /api/v1/login
exports.loginUser = catchAsyncErrors( async(req, res, next) => {
    const { email, password } = req.body;

    //Check if email and password entered by user
    
    if(!email || !password){
        return next(new ErrorHandler('please enter Email & Password', 400));
    }

    //Finding User in database 

    const user = await User.findOne({ email }).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }


    //Check if password coreect or not
    const isPasswordMatched =  await user.comparePassword(password);    

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Password', 401));
    }

    sendToken(user, 200, res)
})


// Forgot password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new ErrorHandler('User Not Found With this email', 404));
    }

    // Get Reset Token 

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    
    // Create Reset Password URL 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf You have not requested this email then ignore it.`


    try {

        await sendEmail({
            email: user.email,
            subject:'E-Commerce Password Recovery',
            message
        })

        res.status(200).json({
            success:true,
            message:`Email Sent To: ${user.email}`
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})


// Reset password => /api/v1/password/reset
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')


    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Password Reset Token Is Invalid or Has Been Expired ', 400))
    }

    if( req.body.password !== req.body.confirmPassword ){
        return next(new ErrorHandler('Password Does Not Match', 400))
    }

    // Setup New Password 
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})


// Get Currently LogedIn User Details => /api/v1/me

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);


    res.status(200).json({
        success: true,
        user
    })

})


// Update / Change Password  => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    // Check previous user Password 
    const isMatched =  await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHandler('Old Password is incorrect', 400));
    }
    if( req.body.oldPassword === req.body.password ){
        return next(new ErrorHandler('Password Already Used', 400))
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res)


})


// Update User Profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserdata = {
        name: req.body.name,
        email: req.body.email
    }

    // Update Avatar : TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
        new: true,
        runValidators: true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})

// Logout User => /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})



// Get All User  => /api/v1/admin/users

exports.allUsers = catchAsyncErrors(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })

})

// Get User Details  => /api/v1/admin/users/:id

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does Not Found With ID: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })

})

// Update User Profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserdata = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }


    const user = await User.findByIdAndUpdate(req.params.id, newUserdata, {
        new: true,
        runValidators: true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})
// Delete User  => /api/v1/admin/users/:id

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does Not Found With ID: ${req.params.id}`))
    }


    // Remove Avatar From Cloudinary - TODO

    await user.deleteOne();

    res.status(200).json({
        success: true
    })

})





