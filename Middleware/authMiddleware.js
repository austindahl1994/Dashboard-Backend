import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const TS = process.env.TOKEN_SECRET;
const RTS = process.env.REFRESH_TOKEN_SECRET;

const authJwt = async (req, res, next) => {
    const accessToken = req.cookies.accessToken
    console.log(`Checking session`)
    try {
        if (!accessToken) {
            console.log(`No token passed in`)
        }
        jwt.verify(accessToken, TS, (err, user) => {
            if (err) {
                console.error(`Error: ${err}`)
            }
            console.log(`No error validating JWT`)
            next()
        })
    } catch (error) {
        console.error(`Error: ${error}`)
        next()
    }
}

const authUser = (req, res) => {

}

export { authJwt, authUser }