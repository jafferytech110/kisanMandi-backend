import express, {json} from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import {dirname, join} from 'path'
import { fileURLToPath } from "url";
import registerRouter from './routes/register-routes.js';
import loginRouter from './routes/login-routes.js'

// looking for dotenv file and pulling env var
dotenv.config()


// using es module this is why, for static file
const __dirname = dirname(fileURLToPath(import.meta.url))

// server
const app = express()
const PORT = process.env.PORT || 5000
const corsOptions = {
    credentials: true, // Allow cookies and authentication headers to be sent
    origin: process.env.URL || '*', // Replace with your frontend URL or '*' for any origin
  };

// middleware
app.use(cors(corsOptions))
app.use(json())
app.use(cookieParser())


// static files
app.use('/', express.static(join(__dirname,'public')))
app.use('/api/register', registerRouter)
app.use('/api/login', loginRouter)

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})