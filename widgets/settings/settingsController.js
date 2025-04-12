import * as settings from './settings.js'

export const updateSettings = async (req, res) => {
  const {user_id, data} = req.body
  const widgetName = req.params.widgetName
  try {
    if (!user_id || !!widgetName) throw new Error("Need a valid user and widget in order to update")
    const response = await settings.updateSetting(user_id, widgetName, data)
    if (response.affectedRows === 0) throw new Error("Did not update any rows!")
    res.status(200).json({message: `Successfully updated ${response.affectedRows} rows`})
  } catch (error) {
    res.status(400).json({message: `Could not update settings in database, error of: ${error}`})
  }
}

export const deleteSettings = async (req, res) => {
  const {user_id} = req.body
  const widgetName = req.params.widgetName
  try {
    if (!user_id || !!widgetName) throw new Error("Need a valid user and widget in order to update")
    const response = await settings.deleteSettings(user_id, widgetName)
    if (response.affectedRows === 0) throw new Error("Did not delete any rows!")
    res.status(200).json({message: `Successfully delete ${widgetName} settings`})
  } catch (error) {
    res.status(400).json({message: `Could not delete settings in database, error of: ${error}`})
  }
}
