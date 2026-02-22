// THIS IS THE MODEL FOR BATTLESHIP MVC
// GETPLAYERS - Get all players, their stats, hits, misses, etc
// STORE SHIP LOCATIONS WITH ITEMS HERE OR IN GOOGLE SHEETS? - Probably better to store in google sheets for easier editing, just need to cache it here

import pool from "@/db/mysqlPool.js";
import { PlayerBSData } from "@/types/battleship.ts";

export const getBattleshipDBData = async (): Promise<PlayerBSData[]> => {
  try {
    const query = `SELECT * FROM playerBSData`;
    const [rows] = await pool.query(query);
    return rows as PlayerBSData[];
  } catch (error) {
    throw error;
  }
};

export const getDBShips = async () => {
  try {
    const query = `SELECT * FROM ships`;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

export const updatePlayerData = async (playerBSData: PlayerBSData) => {
  try {
    const { rsn, url } = playerBSData;
    const query = `INSERT INTO playerBSData (rsn, url) VALUES (?, ?)`;
    await pool.query(query, [rsn, url]);
  } catch (error) {
    throw error;
  }
};

/**
 interface bsData {
	id: number
	item: string
	url: string
	coord: string //A1, A2, etc...
	obtained: bool 
	hit: bool 
}
 */
// obtained_at timestamp DEFAULT CURRENT_TIMESTAMP
