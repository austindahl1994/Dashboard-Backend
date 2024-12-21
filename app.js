import express from 'express'
import cors from 'cors'

import profileRoutes from './widgets/charGen/profileRoutes.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/profile', profileRoutes)

export default app