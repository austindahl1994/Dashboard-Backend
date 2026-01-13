import pool from "@/db/mysqlPool.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Completion } from "@/types/completion.js";
import { Shame } from "@/types/shame.ts";

export const addCompletion = async (data: Completion): Promise<number> => {
  try {
    const { team, tile_id, rsn, url, item } = data;
    const query = `INSERT INTO completions (team, tile_id, rsn, url, item) VALUES (?, ?, ?, ?, ?);`;
    const [response] = await pool.execute<ResultSetHeader>(query, [
      team,
      tile_id,
      rsn,
      url,
      item,
    ]);
    console.log(`Response for addCompletion query:`);
    console.log(response);
    if (response.affectedRows !== 1) {
      throw new Error(`Failed to add completion entry for player: ${rsn}`);
    }
    return response.insertId;
  } catch (error) {
    console.error(`There was an error adding completion: ${error}`);
    throw error;
  }
};

// Currently gets all completions from database
export const getCompletions = async (): Promise<Completion[]> => {
  try {
    const [rows] = (await pool.execute(
      `SELECT team, tile_id, rsn, url, item, obtained_at FROM completions;`
    )) as [any[], any];
    return rows.map(
      (r) =>
        ({
          team: Number(r.team),
          tile_id: Number(r.tile_id),
          rsn: String(r.rsn),
          url: String(r.url),
          item: r.item,
          obtained_at: String(r.obtained_at),
        } as Completion)
    );
  } catch (error) {
    throw error;
  }
};

// id (auto increment): number, playerName: string, pvp: bool, killer: string, created_at: timestamp
export const addShame = async (data: Shame) => {
  try {
    const { playerName, pvp, killer, url } = data;
    const query = `INSERT INTO shame (playerName, pvp, killer, url) VALUES (?, ?, ?, ?);`;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      playerName,
      pvp,
      killer,
      url,
    ]);

    console.log(`Response for addShame query:`);
    console.log(result);
    if (result.affectedRows !== 1) {
      throw new Error(`Failed to add shame entry for player: ${playerName}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getShame = async (): Promise<Shame[]> => {
  try {
    const query = "SELECT * FROM shame;";
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    return rows as Shame[];
  } catch (error) {
    throw error;
  }
};

/*
  CREATE TABLE shame (
  id INT NOT NULL AUTO_INCREMENT,
  playerName VARCHAR(100) NOT NULL,
  pvp TINYINT(1) NOT NULL DEFAULT 0,
  killer VARCHAR(255),
  url VARCHAR(2083),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
 */
