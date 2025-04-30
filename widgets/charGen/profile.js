import pool from "../../db/mysqlPool.js";

const saveProfile = async (user_id, name, data) => {
  //console.log(`Attempting to create profile with name: ${name}`);
  const query =
    "REPLACE INTO profiles (user_id, name, properties) VALUES(?, ?, ?)";
  try {
    const [result] = await pool.execute(query, [
      user_id,
      name,
      JSON.stringify(data),
    ]);
    console.log(`Profile saved successfully`)
    console.log(`Result: ${result.insertId}`)
    return result;
  } catch (error) {
    //console.log(`Error creating profile`)
    throw error;
  }
};

const getProfile = async (user_id, name) => {
  //console.log(`Called get profile with name: ${name}`);
  const query = "SELECT * FROM profiles WHERE name=? AND user_id=?";
  try {
    const [rows] = await pool.execute(query, [name, user_id]);
    return rows[0];
  } catch (error) {
    //console.log(`There was an error: ${error}`);
    throw error;
  }
};

const getRecentProfiles = async (user_id) => {
  //console.log(`Calling recent profiles model`);
  const query =
    "SELECT name FROM profiles WHERE user_id=? ORDER BY time_updated DESC";
  try {
    const [rows] = await pool.execute(query, [user_id]);
    return rows;
  } catch (error) {
    console.error(`There was an error getting the rows: ${error}`);
    throw error;
  }
};

const deleteProfile = async (user_id, name) => {
  const query = "DELETE FROM profiles WHERE name=? AND user_id=?";
  try {
    const [result] = await pool.execute(query, [name, user_id]);
    //console.log(`Deletion successful: ${result}`)
    return result;
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw error;
  }
};

export {
  saveProfile,
  getProfile,
  getRecentProfiles,
  deleteProfile,
};
