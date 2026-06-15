import pool from "../../../db/mysqlPool.js";
import type { CabbageUser } from "@/types/index.ts";

export const updateCabbageUser = async (
  discord_id: string,
  discord_username: string,
  rsn: string,
  role: string,
) => {
  try {
    const query = `INSERT INTO CabbageUsers (discord_id, discord_username, rsn, role, updated_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        discord_username = VALUES(discord_username),
        rsn = VALUES(rsn),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP`;
    const rows = await pool.execute(query, [
      discord_id,
      discord_username,
      rsn,
      role,
    ]);
    return rows;
  } catch (error) {
    console.error(`Error updating Cabbage user: ${error}`);
    throw error;
  }
};

export const getCabbageUserByDiscordId = async (
  discord_id: string,
): Promise<CabbageUser | null> => {
  const query =
    "SELECT discord_id, discord_username, rsn, role FROM CabbageUsers WHERE discord_id = ? LIMIT 1";

  try {
    console.log("[Discord OAuth] Querying CabbageUsers table", { discord_id });
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
    console.log("[Discord OAuth] Cabbage user row loaded", {
      discord_id: record.discord_id,
      discord_username: record.discord_username,
      rsn: record.rsn,
      role: record.role,
    });
    return {
      discord_id: record.discord_id,
      discord_username: record.discord_username,
      rsn: record.rsn,
      role: record.role,
    };
  } catch (error) {
    console.error(`Error getting Cabbage user by Discord id: ${error}`);
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
