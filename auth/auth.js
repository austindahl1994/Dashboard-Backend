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

export { login };
