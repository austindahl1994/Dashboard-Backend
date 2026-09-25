/**
 * TABLE LAYOUT REFERENCE: BingoUsers
 *
 * id                 INT AUTO_INCREMENT      PRIMARY KEY
 * cabbage_id         INT                     NOT NULL, UNIQUE (one signup per user), FK -> CabbageUsers(id) ON DELETE CASCADE
 * rsn                VARCHAR(12)             NOT NULL
 * intended_hours     INT                     NOT NULL DEFAULT 0
 * paying_for_others  TINYINT                 NOT NULL DEFAULT 0
 * covered_players    JSON                    NULL (array of RSN strings; [] when not paying for others)
 * donation           BIGINT                  NOT NULL DEFAULT 0 (raw gp)
 * notes              TEXT                    NULL
 * status             ENUM('unpaid','paid','zeroed') NOT NULL DEFAULT 'unpaid'
 * created_at         TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP
 * updated_at         TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * status_updated_at  TIMESTAMP               NULL DEFAULT NULL
 * status_updated_by  INT                     NULL, FK -> CabbageUsers(id) ON DELETE SET NULL (moderator who changed status)
 *
 * KEYS: PRIMARY (id), UNIQUE uq_bingo_users_cabbage (cabbage_id), INDEX idx_bingo_users_status (status)
 */

/**
 * CREATE TABLE BingoUsers (id INT AUTO_INCREMENT PRIMARY KEY, cabbage_id INT NOT NULL, rsn VARCHAR(12) NOT NULL, intended_hours INT NOT NULL DEFAULT 0, paying_for_others TINYINT NOT NULL DEFAULT 0, covered_players JSON NULL, donation BIGINT NOT NULL DEFAULT 0, notes TEXT NULL, status ENUM('unpaid','paid','zeroed') NOT NULL DEFAULT 'unpaid', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, status_updated_at TIMESTAMP NULL DEFAULT NULL, status_updated_by INT NULL, UNIQUE KEY uq_bingo_users_cabbage (cabbage_id), INDEX idx_bingo_users_status (status), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE, FOREIGN KEY (status_updated_by) REFERENCES CabbageUsers(id) ON DELETE SET NULL);
 */

import pool from "@/db/mysqlPool.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool, PoolConnection } from "mysql2/promise";

type SqlExecutor = Pool | PoolConnection;

export const BINGO_SIGNUP_STATUSES = ["unpaid", "paid", "zeroed"] as const;

export type BingoSignupStatus = (typeof BINGO_SIGNUP_STATUSES)[number];

export type BingoCoveredBy = {
  id: number;
  rsn: string;
};

export type BingoSignup = {
  id: number;
  cabbageId: number;
  rsn: string;
  intendedHours: number;
  payingForOthers: boolean;
  coveredPlayers: string[];
  donation: number;
  notes: string;
  status: BingoSignupStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  statusUpdatedAt: Date | null;
  statusUpdatedBy: number | null;
  coveredBy: BingoCoveredBy | null;
};

export type BingoStatusUpdateResult = {
  signup: BingoSignup;
  previousStatus: BingoSignupStatus;
  cascaded: BingoSignup[];
};

export type BingoDeleteResult = {
  deleted: BingoSignup;
  affected: BingoSignup[];
};

export type BingoSignupInput = {
  cabbageId: number;
  rsn: string;
  intendedHours: number;
  payingForOthers: boolean;
  coveredPlayers: string[];
  donation: number;
  notes: string;
};

type BingoSignupRow = RowDataPacket & {
  id: number;
  cabbage_id: number;
  rsn: string;
  intended_hours: number;
  paying_for_others: number;
  covered_players: unknown;
  donation: number | string;
  notes: string | null;
  status: BingoSignupStatus;
  created_at: Date | null;
  updated_at: Date | null;
  status_updated_at: Date | null;
  status_updated_by: number | null;
};

const SELECT_COLUMNS = `
  id,
  cabbage_id,
  rsn,
  intended_hours,
  paying_for_others,
  covered_players,
  donation,
  notes,
  status,
  created_at,
  updated_at,
  status_updated_at,
  status_updated_by
`;

// mysql2 may hand back JSON columns as an already-parsed value or as a raw string.
const parseCoveredPlayers = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

const mapRow = (row: BingoSignupRow): BingoSignup => ({
  id: Number(row.id),
  cabbageId: Number(row.cabbage_id),
  rsn: row.rsn,
  intendedHours: Number(row.intended_hours) || 0,
  payingForOthers: Number(row.paying_for_others) === 1,
  coveredPlayers: parseCoveredPlayers(row.covered_players),
  donation: Number(row.donation) || 0,
  notes: row.notes ?? "",
  status: row.status,
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
  statusUpdatedAt: row.status_updated_at ?? null,
  statusUpdatedBy:
    row.status_updated_by === null ? null : Number(row.status_updated_by),
  coveredBy: null,
});

export const normalizeRsnKey = (rsn: string): string =>
  rsn.trim().toLowerCase();

type CoverageRow = RowDataPacket & {
  id: number;
  rsn: string;
  covered_players: unknown;
};

/**
 * Maps normalized RSN -> the signup that claims to be paying for it.
 * Rows are read oldest-first so the earliest claim wins when two signups list
 * the same RSN; later claims are logged and ignored rather than throwing.
 */
const buildCoverageIndex = async (
  executor: SqlExecutor = pool,
): Promise<Map<string, BingoCoveredBy>> => {
  const [rows] = await executor.execute<CoverageRow[]>(
    `SELECT id, rsn, covered_players FROM BingoUsers ORDER BY created_at ASC, id ASC`,
  );

  const index = new Map<string, BingoCoveredBy>();

  if (!Array.isArray(rows)) {
    return index;
  }

  for (const row of rows) {
    const payer: BingoCoveredBy = { id: Number(row.id), rsn: row.rsn };
    const payerKey = normalizeRsnKey(row.rsn);

    for (const covered of parseCoveredPlayers(row.covered_players)) {
      const key = normalizeRsnKey(covered);
      if (!key || key === payerKey) continue;

      const existing = index.get(key);
      if (existing) {
        if (existing.id !== payer.id) {
          console.warn(
            `Bingo: RSN "${covered}" is claimed as a covered player by multiple signups (keeping earliest signup ${existing.id} "${existing.rsn}", ignoring signup ${payer.id} "${payer.rsn}")`,
          );
        }
        continue;
      }

      index.set(key, payer);
    }
  }

  return index;
};

const attachCoveredBy = (
  signup: BingoSignup,
  index: Map<string, BingoCoveredBy>,
): BingoSignup => {
  const payer = index.get(normalizeRsnKey(signup.rsn));

  return {
    ...signup,
    coveredBy: !payer || payer.id === signup.id ? null : payer,
  };
};

export const getBingoSignupById = async (
  id: number,
): Promise<BingoSignup | null> => {
  try {
    const [rows] = await pool.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers WHERE id = ? LIMIT 1`,
      [id],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return attachCoveredBy(mapRow(rows[0]), await buildCoverageIndex());
  } catch (error) {
    console.error(`Error getting bingo signup by id: ${error}`);
    throw error;
  }
};

export const getBingoSignupByCabbageId = async (
  cabbageId: number,
): Promise<BingoSignup | null> => {
  try {
    const [rows] = await pool.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers WHERE cabbage_id = ? LIMIT 1`,
      [cabbageId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return attachCoveredBy(mapRow(rows[0]), await buildCoverageIndex());
  } catch (error) {
    console.error(`Error getting bingo signup by cabbage id: ${error}`);
    throw error;
  }
};

export const getAllBingoSignups = async (): Promise<BingoSignup[]> => {
  try {
    const [rows] = await pool.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers ORDER BY created_at ASC, id ASC`,
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    const index = await buildCoverageIndex();

    return rows.map((row) => attachCoveredBy(mapRow(row), index));
  } catch (error) {
    console.error(`Error getting all bingo signups: ${error}`);
    throw error;
  }
};

export const createBingoSignup = async (
  signup: BingoSignupInput,
): Promise<BingoSignup | null> => {
  try {
    // A payer may have already been marked paid/zeroed before this player signed
    // up themselves, so the new row inherits the payer's settled status.
    const payerRef = (await buildCoverageIndex()).get(
      normalizeRsnKey(signup.rsn),
    );
    const payer = payerRef ? await getBingoSignupById(payerRef.id) : null;
    const inherits =
      payer !== null && (payer.status === "paid" || payer.status === "zeroed");

    const query = `
      INSERT INTO BingoUsers
        (cabbage_id, rsn, intended_hours, paying_for_others, covered_players, donation, notes, status, status_updated_at, status_updated_by)
      VALUES (?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      signup.cabbageId,
      signup.rsn,
      signup.intendedHours,
      signup.payingForOthers ? 1 : 0,
      JSON.stringify(signup.coveredPlayers),
      signup.donation,
      signup.notes,
      inherits ? payer.status : "unpaid",
      inherits ? (payer.statusUpdatedAt ?? new Date()) : null,
      inherits ? payer.statusUpdatedBy : null,
    ]);

    return await getBingoSignupById(result.insertId);
  } catch (error) {
    console.error(`Error creating bingo signup: ${error}`);
    throw error;
  }
};

const STATUS_UPDATE_SQL = `
  UPDATE BingoUsers
  SET status = ?, status_updated_at = CURRENT_TIMESTAMP, status_updated_by = ?
  WHERE id
`;

/**
 * Sets a signup's status and cascades the same status to every signup whose RSN
 * appears in that signup's covered_players. All writes share one transaction so
 * a payer and the players they cover can never end up half-updated.
 */
export const updateBingoSignupStatus = async (
  id: number,
  status: BingoSignupStatus,
  moderatorCabbageId: number | null,
): Promise<BingoStatusUpdateResult | null> => {
  const connection = await pool.getConnection();

  let cascadedIds: number[] = [];
  let previousStatus: BingoSignupStatus = status;

  try {
    await connection.beginTransaction();

    const [targetRows] = await connection.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers WHERE id = ? FOR UPDATE`,
      [id],
    );

    if (!Array.isArray(targetRows) || targetRows.length === 0) {
      await connection.rollback();
      return null;
    }

    const target = mapRow(targetRows[0]);
    previousStatus = target.status;

    await connection.execute(`${STATUS_UPDATE_SQL} = ?`, [
      status,
      moderatorCabbageId,
      id,
    ]);

    const coveredKeys = Array.from(
      new Set(
        target.coveredPlayers
          .map(normalizeRsnKey)
          .filter((key) => key && key !== normalizeRsnKey(target.rsn)),
      ),
    );

    if (coveredKeys.length > 0) {
      const placeholders = coveredKeys.map(() => "?").join(", ");

      const [coveredRows] = await connection.query<BingoSignupRow[]>(
        `SELECT id FROM BingoUsers
         WHERE LOWER(TRIM(rsn)) IN (${placeholders}) AND id <> ? AND status <> ?
         FOR UPDATE`,
        [...coveredKeys, id, status],
      );

      cascadedIds = Array.isArray(coveredRows)
        ? coveredRows.map((row) => Number(row.id))
        : [];

      if (cascadedIds.length > 0) {
        const idPlaceholders = cascadedIds.map(() => "?").join(", ");

        await connection.query(`${STATUS_UPDATE_SQL} IN (${idPlaceholders})`, [
          status,
          moderatorCabbageId,
          ...cascadedIds,
        ]);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(`Error updating bingo signup status: ${error}`);
    throw error;
  } finally {
    connection.release();
  }

  const all = await getAllBingoSignups();
  const signup = all.find((entry) => entry.id === id);

  if (!signup) {
    return null;
  }

  return {
    signup,
    previousStatus,
    cascaded: all.filter((entry) => cascadedIds.includes(entry.id)),
  };
};

/**
 * Removes a signup outright. Deleting a payer strips coverage from everyone
 * they were paying for, so the coverage index is rebuilt inside the same
 * transaction and every signup whose derived coveredBy moved is returned.
 */
export const deleteBingoSignup = async (
  id: number,
): Promise<BingoDeleteResult | null> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [targetRows] = await connection.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers WHERE id = ? FOR UPDATE`,
      [id],
    );

    if (!Array.isArray(targetRows) || targetRows.length === 0) {
      await connection.rollback();
      return null;
    }

    const beforeIndex = await buildCoverageIndex(connection);
    const deleted = attachCoveredBy(mapRow(targetRows[0]), beforeIndex);

    await connection.execute(`DELETE FROM BingoUsers WHERE id = ?`, [id]);

    const afterIndex = await buildCoverageIndex(connection);

    const [remainingRows] = await connection.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers ORDER BY created_at ASC, id ASC`,
    );

    const affected = (Array.isArray(remainingRows) ? remainingRows : [])
      .map(mapRow)
      .filter((signup) => {
        const before = attachCoveredBy(signup, beforeIndex).coveredBy;
        const after = attachCoveredBy(signup, afterIndex).coveredBy;
        return (before?.id ?? null) !== (after?.id ?? null);
      })
      .map((signup) => attachCoveredBy(signup, afterIndex));

    await connection.commit();

    return { deleted, affected };
  } catch (error) {
    await connection.rollback();
    console.error(`Error deleting bingo signup: ${error}`);
    throw error;
  } finally {
    connection.release();
  }
};

export const getBingoParticipants = async (): Promise<BingoSignup[]> => {
  try {
    const [rows] = await pool.execute<BingoSignupRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM BingoUsers WHERE status IN ('paid', 'zeroed') ORDER BY rsn ASC`,
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    const index = await buildCoverageIndex();

    return rows.map((row) => attachCoveredBy(mapRow(row), index));
  } catch (error) {
    console.error(`Error getting bingo participants: ${error}`);
    throw error;
  }
};
