import User from '../models/Users.js'
import { signupSchema, sendForgetPasswordCodeSchema, changePasswordSchema, acceptForgotPasswordCodeSchema } from '../middlewares/validators.js'
import { dohash, doHashValidation, hmacProcess } from '../middlewares/hashing.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import transport from '../middlewares/sendMails.js'
import dotenv from 'dotenv'
dotenv.config() 

export const signup = async (req, res) => {
    const { email, password } = req.body

    try {
        const { error, value } = signupSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(401).json({ success: false, message: 'User already exists' })
        }
        const hashedPassword = await dohash(password, 10)
        const newuser = new User({
            email,
            password: hashedPassword
        })
        const user = await newuser.save()
        user.password = undefined
        res.status(201).json({
            success: true, message: 'Your account has been created successfully'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const { error, value } = signupSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email }).select('+password')
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User not exists!' })
        }
        const result = await doHashValidation(password, existingUser.password)
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid credentials!' })
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.TOKEN_SECRET, { expiresIn: '1d' })

        res
            .cookie('Authorization', 'Bearer ' + token, {
                expires: new Date(Date.now() + 8 * 3600000),
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production'
            })
            .json({
                success: true,
                user: {
                    _id: existingUser._id,
                    email: existingUser.email,
                    verified: existingUser.verified
                },
                // token,
                message: 'Logged in successfully'
            })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const logout = async (req, res) => {
    try {
        console.log("Logout")
        res
            .clearCookie('Authorization', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                path: '/',
            })
            .status(200).json({ success: true, message: 'Logout successfully!' })
        console.log("Logout")
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const changePassword = async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const { userId } = req.user
    try {
        const { error, value } = changePasswordSchema.validate({ oldpassword, newpassword })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findById(userId).select('+password')
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User doesn\'t exists' })
        }
        const result = await doHashValidation(oldpassword, existingUser.password)
        if (!result) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
        const hashedPassword = await dohash(newpassword, 10)
        existingUser.password = hashedPassword
        await existingUser.save()
        return res.status(200).json({ success: true, message: 'Password updated' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const sendForgetPasswordCode = async (req, res) => {
    const { email } = req.body
    try {
        const { error, value } = sendForgetPasswordCodeSchema.validate({ email })
        if (error) { 
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User doesnot exists!' })
        }
        const DigitCode = crypto.randomInt(1000, 10000).toString()

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_MAIL_ADDRESS,
            to: existingUser.email,
            subject: "Verification Code",
            html: `<h2>Your verification code is : ${DigitCode}</h2>`
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCode = await hmacProcess(DigitCode, process.env.HMAC_VERIFICATION_SECRET_CODE)
            existingUser.forgetPasswordCode = hashedCode
            existingUser.forgetPasswordCodeValidationTime = Date.now()
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'Code Sent' })
        }
        return res.status(200).json({ success: true, message: 'Code Sent Failed' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const forgetPassword = async (req, res) => {
    const { email, code, newpassword } = req.body
    try {
        const { error, value } = acceptForgotPasswordCodeSchema.validate({ email, code, newpassword })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        let codeValue = code.toString()
        const existingUser = await User.findOne({ email }).select('+forgetPasswordCode +forgetPasswordCodeValidationTime +password')
        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User doesn\'t exists' })
        }
        if (!existingUser.forgetPasswordCode || !existingUser.forgetPasswordCodeValidationTime) {
            return res.status(401).json({ success: false, message: 'Something went wrong!' })
        }

        if (Date.now() - existingUser.forgetPasswordCodeValidationTime > 5 * 60 * 1000) {
            return res.status(401).json({ success: false, message: 'Code has been expired!' })
        }
        codeValue = await hmacProcess(codeValue, process.env.HMAC_VERIFICATION_SECRET_CODE)
        if (codeValue === existingUser.forgetPasswordCode) {
            const hashedPassword = await dohash(newpassword, 10)
            existingUser.password = hashedPassword
            existingUser.forgetPasswordCode = undefined
            existingUser.forgetPasswordCodeValidationTime = undefined
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'Your password changed!' })
        }
        return res.status(400).json({ success: false, message: 'Unexpected occured!' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}