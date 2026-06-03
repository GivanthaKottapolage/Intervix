import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const mongoURI = process.env.MONGO_URL

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to mongodb cluster")
    }
)

const app = express()

app.use(cors())

app.use(express.json())

app.use(
    (req,res,next)=>{

        const AuthorizationHeader = req.header("Authorization")

       if(AuthorizationHeader!=null){

        const token = AuthorizationHeader.replace("Bearer ","")

        //console.log(token)

        jwt.verify(token,process.env.JWT_SECRET,
            (error,content)=>{

                if(content == null){
                    console.log("invalid token")

                    res.status(401).json({
                        message : "Invalid token"
                    })
                    

                }else{
                    console.log(content)
                    req.user = content
                    next()
                }

                
            }
        )

       }else{


            next()

       }

        
    })

app.use("/api/users",userRouter)


app.listen(5000,
    ()=>{
        console.log("server is running")
    }
)