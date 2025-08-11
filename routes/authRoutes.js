import express from 'express'
import * as authController from '../controllers/authController.js'
import {identifier} from '../middlewares/identifier.js'

const router=express.Router()

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/logout',identifier,authController.logout)

router.patch('/change-password',identifier,authController.changePassword)

router.patch('/send-forget-password-code',authController.sendForgetPasswordCode)
router.patch('/forget-password',authController.forgetPassword)

router.get('/me',identifier,(req,res)=>{
    res.status(200).json({success:true,user:req.user})
})
export default router
