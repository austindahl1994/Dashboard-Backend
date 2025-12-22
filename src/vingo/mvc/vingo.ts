import pool from "@/db/mysqlPool.js";
import { RowDataPacket } from "mysql2";
import { Completion } from "@/types/completion.js";

export const addCompletion = async (data: Completion) => {
  try {
    const { team, tile_id, rsn, url, item, obtained_at } = data;
    const query = `INSERT INTO completions (team, tile_id, rsn, url, item, obtained_at) VALUES (?, ?, ?, ?, ?, ?);`;
    const [response] = await pool.execute(query, [
      team,
      tile_id,
      rsn,
      url,
      item,
      obtained_at,
    ]);
    console.log(`Response for addCompletion query:`);
    console.log(response);
    return response;
  } catch (error) {
    console.error(`There was an error adding completion: ${error}`);
    throw error;
  }
};

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

// id: number auto_increments, team: number, tile_id: number, rsn: string, url: string, item: array, obained_at: string
