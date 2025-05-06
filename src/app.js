import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))
app.use((req, res, next) => {
    console.log("Received ${req.method} request with body:", req.body);
    console.log("Received ${req.method} request with params:", req.params);
    next();
});


import userRouter from "./routes/user.routes.js"
import courseRouter from "./routes/course.routes.js"
import moduleRouter from "./routes/module.routes.js"
import quizRouter from "./routes/quiz.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/module", moduleRouter)
app.use("/api/v1/quiz", quizRouter)

export {app}