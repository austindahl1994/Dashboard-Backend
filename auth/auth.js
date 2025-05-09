import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import pool from "../db/mysqlPool.js";

dotenv.config();

const SR = process.env.SALT_ROUNDS;

const login = async (email, password) => {
  //console.log(`Trying to login`)
  const query =
    "SELECT user_id, username, email, password, role FROM users WHERE email=?";
  try {
    const [rows] = await pool.execute(query, [email]);
    if (rows.length === 0) throw new Error("User not found");

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) throw new Error(`Passwords don't match`);

    //(`Successfully logged in, passing back data`);
    const userData = {
      user_id: rows[0].user_id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    };
    //console.log(Object.values(testUserData));
    /*
    * !!UPDATE!! Get widget settings for user after user has been verified
    * SELECT * FROM widgets WHERE user_id=?
    * Add the data from that query to the object being passed back to controller, UPDATE controller next
    */

    return {
      user_id: rows[0].user_id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    };
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw error;
  }
};

const createUser = async (username, email, password) => {
  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  try {
    const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.execute(query, [username, email, hashedPass]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (id) => {
  const query = "SELECT username, email, role FROM users WHERE user_id = ?";
  try {
    const [rows] = await pool.execute(query, [id]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// const logout = async (userId) => {
//   const query = "UPDATE users SET session_id = NULL WHERE user_id = ?";
//   try {
//     const [result] = await pool.execute(query, [userId]);
//     if (result.affectedRows === 0)
//       throw new Error("User not found or already logged out");
//     return { success: true, message: "Logout successful" };
//   } catch (error) {
//     throw error;
//   }
// };

// const checkSessionId = async (userId) => {
//   const query = "SELECT session_id FROM users WHERE user_id = ?";
//   try {
//     const [rows] = await pool.execute(query, [userId]);
//     if (rows.length === 0) throw new Error("User not found");
//     return true;
//   } catch (error) {
//     throw error;
//   }
// };

export { login, createUser, getUserById, };
