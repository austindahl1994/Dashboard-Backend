import pool from "@/db/mysqlPool.js";
import type { Adventurer, TowerFloor } from "@/types/index.ts";

type AdventurerRow = {
  id: number;
  rsn: string;
  discordId: string | null;
  discordAvatar: string | null;
  currentFloor: number;
  item?: string | null;
};

type FloorRow = {
  cabbageId: number;
  floor: number;
  rsn: string;
  url: string | null;
};

type TowerCompletionRow = {
  id: number;
  cabbageId: number;
  floor: number;
  rsn: string;
  item?: string | null;
  url: string;
  completedAt: Date | null;
  verified?: boolean | null;
};

export type TowerCompletion = {
  id: number;
  cabbageId: number;
  floor: number;
  rsn: string;
  item: string;
  url: string;
  completedAt: Date | null;
};

const isMissingColumnError = (error: unknown, columnName: string): boolean => {
  const mysqlError = error as { code?: string; sqlMessage?: string };
  return (
    mysqlError?.code === "ER_BAD_FIELD_ERROR" &&
    (mysqlError?.sqlMessage ?? "").includes(columnName)
  );
};

export const ensureAdventurerRowsExist = async (): Promise<void> => {
  try {
    const query = `
      INSERT INTO Adventurers (id)
      SELECT c.id
      FROM CabbageUsers c
      LEFT JOIN Adventurers a ON c.id = a.id
      WHERE a.id IS NULL
    `;

    await pool.execute(query);
  } catch (error) {
    console.error(
      `There was an error ensuring adventurer rows exist: ${error}`,
    );
    throw error;
  }
};

export const getAdventurerData = async (): Promise<Adventurer[] | null> => {
  try {
    const query = `
      SELECT
        c.id,
        c.rsn,
        c.discord_id AS discordId,
        c.discord_avatar AS discordAvatar,
        COALESCE(a.current_floor, 0) AS currentFloor,
        COALESCE(a.item, '') AS item
      FROM CabbageUsers c
      LEFT JOIN Adventurers a ON c.id = a.id
    `;

    let rows: unknown;

    try {
      [rows] = await pool.execute(query);
    } catch (error) {
      if (!isMissingColumnError(error, "a.item")) {
        throw error;
      }

      const fallbackQuery = `
        SELECT
          c.id,
          c.rsn,
          c.discord_id AS discordId,
          c.discord_avatar AS discordAvatar,
          COALESCE(a.current_floor, 0) AS currentFloor
        FROM CabbageUsers c
        LEFT JOIN Adventurers a ON c.id = a.id
      `;

      [rows] = await pool.execute(fallbackQuery);
    }

    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as AdventurerRow[]).map((row) => ({
      id: row.id,
      rsn: row.rsn,
      discordId: row.discordId,
      discordAvatar: row.discordAvatar,
      currentFloor: Number(row.currentFloor) || 0,
      item: row.item ?? "",
    }));
  } catch (error) {
    console.error(`There was an error getting adventurer data: ${error}`);
    throw error;
  }
};

export const updateAdventurerData = async (
  cabbageId: number,
): Promise<void> => {
  try {
    const query = `
      UPDATE Adventurers
      SET current_floor = current_floor + 1
      WHERE id = ?
    `;
    const result = await pool.execute(query, [cabbageId]);
    console.log(
      `Adventurer data updated successfully: ${JSON.stringify(result)}`,
    );
  } catch (error) {
    console.error(`There was an error updating adventurer data: ${error}`);
    throw error;
  }
};

export const addAdventurer = async (adventurer: Adventurer): Promise<void> => {
  try {
    const query = `
      INSERT INTO Adventurers (id, current_floor, item)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        current_floor = VALUES(current_floor),
        item = VALUES(item)
    `;

    let result;

    try {
      [result] = await pool.execute(query, [
        adventurer.id,
        adventurer.currentFloor,
        adventurer.item,
      ]);
    } catch (error) {
      if (!isMissingColumnError(error, "item")) {
        throw error;
      }

      const fallbackQuery = `
        INSERT INTO Adventurers (id, current_floor)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          current_floor = VALUES(current_floor)
      `;

      [result] = await pool.execute(fallbackQuery, [
        adventurer.id,
        adventurer.currentFloor,
      ]);
    }

    console.log(`Adventurer added successfully: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error(`There was an error adding adventurer: ${error}`);
    throw error;
  }
};

// TowerFloors is used to store the first completion data for each floor, which is used for SSE after a completion
export const getFloorData = async (): Promise<TowerFloor[] | null> => {
  try {
    const query = `
      SELECT
        t.cabbage_id AS cabbageId,
        t.floor,
        c.rsn,
        t.url
      FROM TowerFloors t
      JOIN CabbageUsers c ON c.id = t.cabbage_id
      ORDER BY t.completion_at DESC
    `;

    const [rows] = await pool.execute(query);
    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as FloorRow[]).map((row) => ({
      cabbageId: Number(row.cabbageId),
      floor: Number(row.floor),
      rsn: row.rsn,
      url: row.url,
    }));
  } catch (error) {
    console.error(`There was an error getting floor data: ${error}`);
    throw error;
  }
};

export const addTowerCompletion = async (
  cabbageId: number,
  floor: number,
  url: string,
  item: string,
  verified: boolean | null = null,
): Promise<void> => {
  try {
    const query = `
      INSERT INTO TowerCompletions (cabbage_id, floor, url, item, verified)
      VALUES (?, ?, ?, ?, ?)
    `;

    let result;

    try {
      [result] = await pool.execute(query, [
        cabbageId,
        floor,
        url,
        item,
        verified,
      ]);
    } catch (error) {
      if (
        !isMissingColumnError(error, "item") &&
        !isMissingColumnError(error, "verified")
      ) {
        throw error;
      }

      let fallbackQuery = `
        INSERT INTO TowerCompletions (cabbage_id, floor, url)
        VALUES (?, ?, ?)
      `;
      let fallbackValues: unknown[] = [cabbageId, floor, url];

      if (
        isMissingColumnError(error, "item") &&
        !isMissingColumnError(error, "verified")
      ) {
        fallbackQuery = `
          INSERT INTO TowerCompletions (cabbage_id, floor, url, verified)
          VALUES (?, ?, ?, ?)
        `;
        fallbackValues = [cabbageId, floor, url, verified];
      } else if (
        !isMissingColumnError(error, "item") &&
        isMissingColumnError(error, "verified")
      ) {
        fallbackQuery = `
          INSERT INTO TowerCompletions (cabbage_id, floor, url, item)
          VALUES (?, ?, ?, ?)
        `;
        fallbackValues = [cabbageId, floor, url, item];
      }

      [result] = await pool.execute(fallbackQuery, fallbackValues);
    }

    console.log(
      `Tower completion added successfully: ${JSON.stringify(result)}`,
    );
  } catch (error) {
    console.error(`There was an error adding tower completion: ${error}`);
    throw error;
  }
};

export const addFirstTowerFloorCompletion = async (
  cabbageId: number,
  floor: number,
  url: string,
): Promise<void> => {
  try {
    const [result] = await pool.execute(
      `
        INSERT INTO TowerFloors (cabbage_id, floor, url)
        VALUES (?, ?, ?)
      `,
      [cabbageId, floor, url],
    );

    console.log(
      `Tower first-floor completion added successfully: ${JSON.stringify(result)}`,
    );
  } catch (error) {
    console.error(`There was an error adding first floor completion: ${error}`);
    throw error;
  }
};

export const upsertAdventurerProgress = async (
  cabbageId: number,
  currentFloor: number,
  item: string,
): Promise<void> => {
  try {
    let result;

    try {
      [result] = await pool.execute(
        `
          INSERT INTO Adventurers (id, current_floor, item)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            current_floor = GREATEST(current_floor, VALUES(current_floor)),
            item = VALUES(item)
        `,
        [cabbageId, currentFloor, item],
      );
    } catch (error) {
      if (!isMissingColumnError(error, "item")) {
        throw error;
      }

      [result] = await pool.execute(
        `
          INSERT INTO Adventurers (id, current_floor)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE
            current_floor = GREATEST(current_floor, VALUES(current_floor))
        `,
        [cabbageId, currentFloor],
      );
    }

    console.log(
      `Adventurer progress upserted successfully: ${JSON.stringify(result)}`,
    );
  } catch (error) {
    console.error(`There was an error upserting adventurer progress: ${error}`);
    throw error;
  }
};

export const getCompletionsById = async (
  cabbageId: number,
): Promise<TowerCompletion[]> => {
  try {
    const query = `
      SELECT
        TowerCompletions.id AS id,
        TowerCompletions.cabbage_id AS cabbageId,
        TowerCompletions.floor AS floor,
        c.rsn,
        TowerCompletions.item,
        TowerCompletions.url AS url,
        TowerCompletions.completed_at AS completedAt
      FROM TowerCompletions
      JOIN CabbageUsers c ON c.id = TowerCompletions.cabbage_id
      WHERE TowerCompletions.cabbage_id = ?
      ORDER BY TowerCompletions.completed_at DESC
    `;

    let rows: unknown;

    try {
      [rows] = await pool.execute(query, [cabbageId]);
    } catch (error) {
      if (!isMissingColumnError(error, "TowerCompletions.item")) {
        throw error;
      }

      const fallbackQuery = `
        SELECT
          TowerCompletions.id AS id,
          TowerCompletions.cabbage_id AS cabbageId,
          TowerCompletions.floor AS floor,
          c.rsn,
          TowerCompletions.url AS url,
          TowerCompletions.completed_at AS completedAt
        FROM TowerCompletions
        JOIN CabbageUsers c ON c.id = TowerCompletions.cabbage_id
        WHERE TowerCompletions.cabbage_id = ?
        ORDER BY TowerCompletions.completed_at DESC
      `;

      [rows] = await pool.execute(fallbackQuery, [cabbageId]);
    }

    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as TowerCompletionRow[]).map((row) => ({
      id: Number(row.id),
      cabbageId: Number(row.cabbageId),
      floor: Number(row.floor),
      rsn: row.rsn,
      item: row.item ?? "",
      url: row.url,
      completedAt: row.completedAt,
    }));
  } catch (error) {
    console.error(
      `There was an error getting tower completions by id: ${error}`,
    );
    throw error;
  }
};

type TowerCompletionWithVerified = TowerCompletion & {
  verified: boolean | null;
};

export const getAllCompletions = async (): Promise<
  TowerCompletionWithVerified[]
> => {
  try {
    const query = `
      SELECT
        TowerCompletions.id AS id,
        TowerCompletions.cabbage_id AS cabbageId,
        TowerCompletions.floor AS floor,
        c.rsn,
        TowerCompletions.item,
        TowerCompletions.url AS url,
        TowerCompletions.completed_at AS completedAt,
        TowerCompletions.verified AS verified
      FROM TowerCompletions
      JOIN CabbageUsers c ON c.id = TowerCompletions.cabbage_id
      ORDER BY TowerCompletions.completed_at DESC
    `;

    let rows: unknown;

    try {
      [rows] = await pool.execute(query);
    } catch (error) {
      if (!isMissingColumnError(error, "verified")) {
        throw error;
      }

      [rows] = await pool.execute(`
        SELECT
          TowerCompletions.id AS id,
          TowerCompletions.cabbage_id AS cabbageId,
          TowerCompletions.floor AS floor,
          c.rsn,
          TowerCompletions.item,
          TowerCompletions.url AS url,
          TowerCompletions.completed_at AS completedAt
        FROM TowerCompletions
        JOIN CabbageUsers c ON c.id = TowerCompletions.cabbage_id
        ORDER BY TowerCompletions.completed_at DESC
      `);
    }

    if (!Array.isArray(rows)) {
      return [];
    }

    return (rows as TowerCompletionRow[]).map((row) => ({
      id: Number(row.id),
      cabbageId: Number(row.cabbageId),
      floor: Number(row.floor),
      rsn: row.rsn,
      item: row.item ?? "",
      url: row.url,
      completedAt: row.completedAt,
      verified: row.verified ?? null,
    }));
  } catch (error) {
    console.error(`There was an error getting all tower completions: ${error}`);
    throw error;
  }
};

export const updateCompletionVerifiedStatus = async (
  completionId: number,
  verified: boolean,
): Promise<void> => {
  try {
    const query = `
      UPDATE TowerCompletions
      SET verified = ?
      WHERE id = ?
    `;
    await pool.execute(query, [verified, completionId]);
  } catch (error) {
    console.error(
      `There was an error updating completion verified status: ${error}`,
    );
    throw error;
  }
};

/**
 * AWS CLI single-line SQL snippets:
 * CREATE TABLE Adventurers (id INT PRIMARY KEY, current_floor INT NOT NULL DEFAULT 0, item VARCHAR(255) NOT NULL DEFAULT '', FOREIGN KEY (id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 * CREATE TABLE TowerFloors (id INT AUTO_INCREMENT PRIMARY KEY, cabbage_id INT NOT NULL, floor INT NOT NULL, url VARCHAR(255) NULL, completion_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_towerfloors_floor (floor), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 * CREATE TABLE TowerCompletions (id INT AUTO_INCREMENT PRIMARY KEY, cabbage_id INT NOT NULL, floor INT NOT NULL, url VARCHAR(255) NOT NULL, item VARCHAR(255) NOT NULL, completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_tower_completions_cabbage_id (cabbage_id), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 * INSERT INTO Adventurers (id) SELECT c.id FROM CabbageUsers c LEFT JOIN Adventurers a ON c.id = a.id WHERE a.id IS NULL;
 * SELECT c.id, c.rsn, c.discord_id, c.discord_avatar, COALESCE(a.current_floor, 0) AS current_floor, COALESCE(a.item, '') AS item FROM CabbageUsers c LEFT JOIN Adventurers a ON c.id = a.id;
 * SELECT t.cabbage_id, t.floor, c.rsn, c.discord_id, t.completion_at FROM TowerFloors t JOIN CabbageUsers c ON c.id = t.cabbage_id ORDER BY t.completion_at DESC;
 * SELECT id, cabbage_id, floor, item, url, completed_at FROM TowerCompletions WHERE cabbage_id = ? ORDER BY completed_at DESC;
 */
