import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import authRouters from './routes/authRoutes.js'
import prevyrspapersRouters from './routes/prevyrspapersRoutes.js'
import dotenv from 'dotenv' 
dotenv.config()


const app = express()

const corsOption={
  origin:process.env.FRONT_URL,
  credentials:true,
  methods:['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders:['Content-Type','Authorization']
}

app.use(cors(corsOption))
app.use(helmet())
app.use(cookieParser())

app.use(express.json())
app.use('/api/auth',authRouters)
app.use('/api/prevyrspapers',prevyrspapersRouters)

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("Databse COnnected!")
}).catch((err)=>{
  console.error(err)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)  
}) 