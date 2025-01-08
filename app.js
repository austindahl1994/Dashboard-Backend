import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { authJwt, authUser } from './Middleware/authMiddleware.js'
import testRoute from './testing/testAuth.js'
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


app.use('/api/profile', authJwt, profileRoutes)
app.use('/api/test', authJwt, testRoute)
app.use('/api', authRoutes)

export default app