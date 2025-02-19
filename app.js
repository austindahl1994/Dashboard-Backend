import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { authJwt } from './Middleware/authMiddleware.js'
import { check } from './auth/checkSession.js'
import profileRoutes from './widgets/charGen/profileRoutes.js'
import authRoutes from './auth/authRoutes.js'

const app = express()
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://www.dahldash.com", // Production
];
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use('/', (req, res) => {
  res.send('Server up and running!')
})
app.use('/check-session', check)
app.use('/profile', authJwt, profileRoutes)
app.use('/auth', authRoutes)

export default app

//leaving off on checking session stuff