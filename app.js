import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { authJwt } from './Middleware/authMiddleware.js'
import { check } from './auth/checkSession.js'
import profileRoutes from './widgets/charGen/profileRoutes.js'
import authRoutes from './auth/authRoutes.js'

const app = express()
const allowedOrigin = "http://localhost:5173";
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}))

app.use('/api/check-session', check)
app.use('/api/profile', authJwt, profileRoutes)
app.use('/api', authRoutes)

export default app

//leaving off on checking session stuff