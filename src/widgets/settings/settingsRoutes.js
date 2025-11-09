import * as sc from './settingsController.js'
import express from 'express'

const router = express.Router()

router.get('/get/:widgetName', sc.getSettings)
router.put('/update/:widgetName', sc.updateSettings)
router.delete('/delete/:widgetName', sc.deleteSettings)

export default router
