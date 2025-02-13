import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "../db/mysqlPool.js";

dotenv.config();

const SR = process.env.SALT_ROUNDS;

const login = async (email, password) => {
  const query =
    "SELECT user_id, username, email, password, role FROM users WHERE email=?";
  try {
    const [rows] = await pool.execute(query, [email]);
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) throw new Error(`Passwords don't match`);
    console.log(`Successfully logged in, passing back data`);
    const user = {
      user_id: rows[0].user_id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    };

    return user;
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

const updateSession = async (sessionId, userId) => {
  const query = "UPDATE users SET session_id = ? WHERE user_id = ?"
  try {
    const result = await pool.execute(query, [sessionId, userId])
  } catch (error) {
    throw error;
  }
}

const deleteSession = async (userId) => {
  const query = "UPDATE users SET session_id = null WHERE user_id = ?";
  try {
    const response = await pool.query(query, [userId])
  } catch (error) {
    throw error
  }
}

const checkSessionId = async (sessionId, userId) => {
  const query = "SELECT sessionId FROM users WHERE userId = ?"
  try {
    const response = await pool.execute(query, [userId])
    if (response[0] !== sessionId) throw error
  } catch (error) {
    throw error
  }
}

export { login, createUser, getUserById, updateSession, deleteSession, checkSessionId };
