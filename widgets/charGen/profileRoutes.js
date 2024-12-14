import express from 'express'
import profileController from './profileController'

const router = express.Router()

router.get('/profile/:name', profileController.getProfile())

export default router