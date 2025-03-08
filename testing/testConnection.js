import pool from "../db/mysqlPool.js";

const testDB = async () => {
  //console.log('Attempting to test DB connection')
  try {
    const [rows] = await pool.query("SELECT * from users");
    //console.log(`Connection successful, response: ${rows[1].user_name}`)
  } catch (error) {
    console.error(`Error connecting to db: ${error}`);
  } finally {
    pool.end();
  }
};

testDB();
