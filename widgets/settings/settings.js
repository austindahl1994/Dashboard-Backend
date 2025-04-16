import pool from '../../db/mysqlPool.js'

export const updateSetting = async (user_id, widgetName, data) => {
  console.log(`Called updateSettigns in model, name: ${widgetName}`)
  const query = "REPLACE INTO widgets (user_id, widget, data) VALUES (?, ?, ?)"
  try {
    const response = await pool.execute(query, [user_id, widgetName, data])
    return response
  } catch (error) {
    throw new Error(`Could not update widget settings`)
  }
}

export const deleteSetting = async (user_id) => {
  const query = "DELETE FROM widgets WHERE user_id=?"
  try {
    const response = await pool.execute(query, [user_id])
    return response
  } catch (error) {
    throw new Error(`Could not delete widget settings`)
  }
}
