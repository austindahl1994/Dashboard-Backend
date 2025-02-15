import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const TS = process.env.TOKEN_SECRET
const RTS = process.env.REFRESH_TOKEN_SECRET

const createToken = (user_id, role, session_id) => {
    return jwt.sign({user_id: user_id, role: role, session_id: session_id}, TS, {expiresIn: '1h'})
}

const createRefreshtoken = (user_id) => {
    return jwt.sign({user_id}, RTS, {expiresIn: '1d'})
}

export { createToken, createRefreshtoken }