import * as sc from './settingsController.js'
import express from 'express'

const router = express.Router()

router.get('/getSettings')//Update later to instead get all widget settings upon login
router.put('/updateSetting/:widgetName', sc.updateSettings)
router.delete('deleteSettings/:widgetName', sc.deleteSettings)

export default router
