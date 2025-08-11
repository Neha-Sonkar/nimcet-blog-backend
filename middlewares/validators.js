import joi from 'joi'

export const signupSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    password:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})

export const changePasswordSchema=joi.object({
    oldpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)),
    newpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})

export const sendForgetPasswordCodeSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
})

export const acceptForgotPasswordCodeSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    code:joi.number()
        .required(),
    newpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})