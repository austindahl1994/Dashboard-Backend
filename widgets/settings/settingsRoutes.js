import * as sc from './settingsController.js'
import Express from 'express'

const router = express.Router()

router.put('/updateSetting/:widgetName', sc.updateSettings)
router.delete('deleteSettings/:widgetName', sc.deleteSettings)

export default router
