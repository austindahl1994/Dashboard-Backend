import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db/mysqlPool.js";

export interface Notification extends RowDataPacket {
  id: number;
  cabbage_id: number;
  type: string;
  title?: string | null;
  message: string;
  image?: string;
  acknowledged: boolean;
  created_at: Date;
  acknowledged_at?: Date;
}

const isMissingColumnError = (error: unknown, columnName: string): boolean => {
  const mysqlError = error as { code?: string; sqlMessage?: string };
  return (
    mysqlError?.code === "ER_BAD_FIELD_ERROR" &&
    (mysqlError?.sqlMessage ?? "").includes(columnName)
  );
};

export const createNotification = async (
  cabbageId: number,
  type: string,
  title: string,
  message: string,
  image?: string,
): Promise<Notification | null> => {
  try {
    let result: ResultSetHeader;

    try {
      const [insertWithTitle] = await pool.query<ResultSetHeader>(
        "INSERT INTO Notifications (cabbage_id, type, title, message, image) VALUES (?, ?, ?, ?, ?)",
        [cabbageId, type, title, message, image ?? null],
      );
      result = insertWithTitle;
    } catch (error) {
      if (!isMissingColumnError(error, "title")) {
        throw error;
      }

      const [insertFallback] = await pool.query<ResultSetHeader>(
        "INSERT INTO Notifications (cabbage_id, type, message, image) VALUES (?, ?, ?, ?)",
        [cabbageId, type, message, image ?? null],
      );
      result = insertFallback;
    }

    const createdNotificationId = Number(result.insertId);
    const [rows] = await pool.query<Notification[]>(
      "SELECT * FROM Notifications WHERE id = ? AND cabbage_id = ? LIMIT 1",
      [createdNotificationId, cabbageId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    return {
      ...rows[0],
      title: rows[0]?.title ?? title,
    };
  } catch (error) {
    console.error(`Error creating notification: ${error}`);
    return null;
  }
};

export const getNotificationsForUser = async (
  cabbageId: number,
): Promise<Notification[]> => {
  try {
    const [rows] = await pool.query<Notification[]>(
      "SELECT * FROM Notifications WHERE cabbage_id = ? AND acknowledged = FALSE ORDER BY created_at DESC",
      [cabbageId],
    );
    return rows;
  } catch (error) {
    console.error(`Error getting notifications for user: ${error}`);
    return [];
  }
};

export const acknowledgeNotification = async (
  cabbageId: number,
  notificationId: number,
): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE Notifications SET acknowledged = TRUE, acknowledged_at = NOW() WHERE id = ? AND cabbage_id = ?",
      [notificationId, cabbageId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error acknowledging notification: ${error}`);
    return false;
  }
};

/**
 * CREATE TABLE Notifications (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, cabbage_id INT UNSIGNED NOT NULL, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message VARCHAR(255) NOT NULL, image VARCHAR(255) NULL, acknowledged BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, acknowledged_at DATETIME NULL, INDEX idx_notifications_user (cabbage_id),  INDEX idx_notifications_user_ack (cabbage_id, acknowledged), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id));
 */
