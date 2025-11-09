import pool from "../../db/mysqlPool.js";

export const updateSetting = async (user_id, widgetName, data) => {
  // console.log(
  //   `Called updateSettigns in model, name: ${widgetName}, data of ${data}`
  // );
  const query =
    "INSERT INTO widgets (user_id, widget, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)";
  try {
    const response = await pool.execute(query, [user_id, widgetName, data]);
    return response;
  } catch (error) {
    console.log(`Could not update widget settings, ${error.message}`);
    throw new Error(`Could not update widget settings`);
  }
};

export const getSettings = async (user_id, widgetName) => {
  //console.log(`Passed in id: ${user_id} and name for widget: ${widgetName}`)
  const query = "SELECT * FROM widgets WHERE user_id = ? AND widget = ?";
  try {
    const [rows] = await pool.execute(query, [user_id, widgetName]);
    //console.log(rows[0].data);
    return rows[0].data;
  } catch (error) {
    console.log(`Could not get widget settings, ${error.message}`);
    throw new Error(`Could not get widget settings`);
  }
};

export const deleteSetting = async (user_id) => {
  const query = "DELETE FROM widgets WHERE user_id=?";
  try {
    const response = await pool.execute(query, [user_id]);
    return response;
  } catch (error) {
    throw new Error(`Could not delete widget settings`);
  }
};
