import pool from "../../../db/mysqlPool.js";
import type { CabbageUser } from "@/types/index.ts";
import bcrypt from "bcrypt";

const SR = Number(process.env.SALT_ROUNDS);

export const updateCabbageUser = async (
  discord_id: string,
  discord_username: string,
  rsn: string,
  discord_avatar: string | null,
  role: string,
) => {
  try {
    const query = `INSERT INTO CabbageUsers (discord_id, discord_username, rsn, discord_avatar, role, updated_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        discord_username = VALUES(discord_username),
        rsn = VALUES(rsn),
        discord_avatar = VALUES(discord_avatar),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP`;
    const rows = await pool.execute(query, [
      discord_id,
      discord_username,
      rsn,
      discord_avatar,
      role,
    ]);
    return rows;
  } catch (error) {
    console.error(`Error updating Cabbage user: ${error}`);
    throw error;
  }
};

export const updateCabbageUserPassword = async (
  discord_id: string,
  password: string,
) => {
  try {
    if (!Number.isInteger(SR) || SR <= 0) {
      throw new Error("SALT_ROUNDS must be a positive integer");
    }

    const hashedPass = await bcrypt.hash(password, SR);
    const query = `UPDATE CabbageUsers SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE discord_id = ?`;
    const rows = await pool.execute(query, [hashedPass, discord_id]);
    return rows;
  } catch (error) {
    console.error(`Error updating Cabbage user password: ${error}`);
    throw error;
  }
};

export const getCabbageUserByDiscordId = async (
  discord_id: string,
): Promise<CabbageUser | null> => {
  const query =
    "SELECT id, discord_id, discord_username, rsn, discord_avatar, role FROM CabbageUsers WHERE discord_id = ? LIMIT 1";

  try {
    // console.log("[Discord OAuth] Querying CabbageUsers table", { discord_id });
    const [rows] = await pool.execute(query, [discord_id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("[Discord OAuth] No Cabbage user found", { discord_id });
      return null;
    }

    const user = rows[0];

    if (!user || typeof user !== "object") {
      return null;
    }

    const record = user as CabbageUser;
    // console.log("[Discord OAuth] Cabbage user row loaded", {
    //   discord_id: record.discord_id,
    //   discord_username: record.discord_username,
    //   rsn: record.rsn,
    //   role: record.role,
    // });
    return {
      id: record.id,
      discord_id: record.discord_id,
      discord_username: record.discord_username,
      rsn: record.rsn,
      discord_avatar: record.discord_avatar,
      role: record.role,
    };
  } catch (error) {
    console.error(`Error getting Cabbage user by Discord id: ${error}`);
    throw error;
  }
};

export const getAllCabbageUsers = async (): Promise<CabbageUser[]> => {
  try {
    const query =
      "SELECT id, discord_id, discord_username, rsn, discord_avatar, role FROM CabbageUsers";
    const [rows] = await pool.execute(query);
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows as CabbageUser[];
  } catch (error) {
    console.error(`Error getting all Cabbage users: ${error}`);
    throw error;
  }
};

type CabbageAuthRow = CabbageUser & { password: string };

export const cabbageLogin = async (
  discord_id: string,
  password: string,
): Promise<CabbageUser> => {
  try {
    const query = `
      SELECT id, discord_id, discord_username, rsn, discord_avatar, role, password
      FROM CabbageUsers
      WHERE discord_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [discord_id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = rows[0] as CabbageAuthRow;

    if (
      !user ||
      typeof user !== "object" ||
      typeof user.password !== "string"
    ) {
      throw new Error("Invalid user record");
    }

    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user.id,
      discord_id: user.discord_id,
      discord_username: user.discord_username,
      rsn: user.rsn,
      discord_avatar: user.discord_avatar,
      role: user.role,
    };
  } catch (error) {
    console.error(`Error during Cabbage login: ${error}`);
    throw error;
  }
};

// TO ADD IN
/**
 * CREATE TABLE CabbageUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(36) NOT NULL UNIQUE,
    discord_username VARCHAR(36) NOT NULL,
    rsn VARCHAR(25),
    role ENUM('player', 'moderator') NOT NULL DEFAULT 'player',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
 */
