import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const identifier=(req,res,next)=>{
    let token
    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization
    } else {
        token = req.cookies['Authorization']
    }

    if(!token)
        return res.status(403).json({success:false,message:'Unauthorized'})

    try{
        const userTooken=token.startsWith('Bearer')?token.split(' ')[1]:token
        const jwtVerified=jwt.verify(userTooken,process.env.TOKEN_SECRET)
        if(jwtVerified){
            req.user=jwtVerified
            next()
        }
        else{
            throw new Error('Error in the token')
        }
    }
    catch(error){
        console.error(error)
    }
}