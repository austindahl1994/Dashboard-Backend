import pool from "@/db/mysqlPool.js";
import type {
  CardFinish,
  CardInventory,
  CollectedCard,
  OpenedCard,
} from "../cardTypes.js";
import { resolveCardName, resolvePackName } from "../globalCards.ts";
import {
  mapCollectedCardRows,
  mapInventoryRows,
  mapOpenedCardsForPersistence,
} from "../cardProcesses.ts";

export const ensureCardInventoryExists = async (
  cabbageId: number,
): Promise<void> => {
  try {
    await pool.execute(
      `
				INSERT INTO CardInventory (cabbage_id)
				VALUES (?)
				ON DUPLICATE KEY UPDATE cabbage_id = VALUES(cabbage_id)
			`,
      [cabbageId],
    );
  } catch (error) {
    console.error(
      `There was an error ensuring card inventory exists: ${error}`,
    );
    throw error;
  }
};

export const getCardInventory = async (
  cabbageId: number,
): Promise<CardInventory> => {
  try {
    await ensureCardInventoryExists(cabbageId);

    const [rows] = await pool.execute(
      `
				SELECT
					ci.cabbage_id AS cabbageId,
					ci.coins AS coins,
					cip.pack_name AS packName,
					cip.quantity AS quantity
				FROM CardInventory ci
				LEFT JOIN CardInventoryPacks cip ON cip.cabbage_id = ci.cabbage_id
				WHERE ci.cabbage_id = ?
				ORDER BY cip.pack_name ASC
			`,
      [cabbageId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        cabbageId,
        coins: 0,
        packs: [],
      };
    }

    return mapInventoryRows(rows as Parameters<typeof mapInventoryRows>[0]);
  } catch (error) {
    console.error(`There was an error getting card inventory: ${error}`);
    throw error;
  }
};

export const setInventoryCoins = async (
  cabbageId: number,
  coins: number,
): Promise<void> => {
  try {
    await pool.execute(
      `
				INSERT INTO CardInventory (cabbage_id, coins)
				VALUES (?, ?)
				ON DUPLICATE KEY UPDATE coins = VALUES(coins)
			`,
      [cabbageId, Math.max(0, Math.floor(coins))],
    );
  } catch (error) {
    console.error(`There was an error setting inventory coins: ${error}`);
    throw error;
  }
};

export const incrementInventoryCoins = async (
  cabbageId: number,
  coinDelta: number,
): Promise<void> => {
  try {
    await ensureCardInventoryExists(cabbageId);
    await pool.execute(
      `
				UPDATE CardInventory
				SET coins = GREATEST(0, coins + ?)
				WHERE cabbage_id = ?
			`,
      [Math.floor(coinDelta), cabbageId],
    );
  } catch (error) {
    console.error(`There was an error incrementing inventory coins: ${error}`);
    throw error;
  }
};

export const setPackQuantity = async (
  cabbageId: number,
  packName: string,
  quantity: number,
): Promise<void> => {
  try {
    const canonicalPackName = resolvePackName(packName);
    await ensureCardInventoryExists(cabbageId);
    await pool.execute(
      `
				INSERT INTO CardInventoryPacks (cabbage_id, pack_name, quantity)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
			`,
      [cabbageId, canonicalPackName, Math.max(0, Math.floor(quantity))],
    );
  } catch (error) {
    console.error(`There was an error setting pack quantity: ${error}`);
    throw error;
  }
};

export const incrementPackQuantity = async (
  cabbageId: number,
  packName: string,
  quantityDelta = 1,
): Promise<void> => {
  try {
    const canonicalPackName = resolvePackName(packName);
    await ensureCardInventoryExists(cabbageId);
    await pool.execute(
      `
				INSERT INTO CardInventoryPacks (cabbage_id, pack_name, quantity)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE quantity = GREATEST(0, quantity + VALUES(quantity))
			`,
      [cabbageId, canonicalPackName, Math.floor(quantityDelta)],
    );
  } catch (error) {
    console.error(`There was an error incrementing pack quantity: ${error}`);
    throw error;
  }
};

export const consumePack = async (
  cabbageId: number,
  packName: string,
  quantity = 1,
): Promise<void> => {
  try {
    const canonicalPackName = resolvePackName(packName);
    await ensureCardInventoryExists(cabbageId);
    await pool.execute(
      `
				UPDATE CardInventoryPacks
				SET quantity = GREATEST(0, quantity - ?)
				WHERE cabbage_id = ? AND pack_name = ?
			`,
      [Math.max(1, Math.floor(quantity)), cabbageId, canonicalPackName],
    );
  } catch (error) {
    console.error(`There was an error consuming a pack: ${error}`);
    throw error;
  }
};

export const getCardCollection = async (
  cabbageId: number,
): Promise<CollectedCard[]> => {
  try {
    const [rows] = await pool.execute(
      `
				SELECT
					id,
					cabbage_id AS cabbageId,
					card_name AS cardName,
					quantity,
					shiny_quantity AS shinyQuantity,
					negative_quantity AS negativeQuantity,
					last_obtained_at AS lastObtainedAt
				FROM CardCollection
				WHERE cabbage_id = ?
				ORDER BY card_name ASC
			`,
      [cabbageId],
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return mapCollectedCardRows(
      rows as Parameters<typeof mapCollectedCardRows>[0],
    );
  } catch (error) {
    console.error(`There was an error getting card collection: ${error}`);
    throw error;
  }
};

export const upsertCollectedCard = async (
  cabbageId: number,
  cardName: string,
  finish: CardFinish = "normal",
  quantity = 1,
): Promise<void> => {
  try {
    const canonicalCardName = resolveCardName(cardName);
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    const shinyQuantity = finish === "shiny" ? normalizedQuantity : 0;
    const negativeQuantity = finish === "negative" ? normalizedQuantity : 0;

    await pool.execute(
      `
				INSERT INTO CardCollection (
					cabbage_id,
					card_name,
					quantity,
					shiny_quantity,
					negative_quantity,
					last_obtained_at
				)
				VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
				ON DUPLICATE KEY UPDATE
					quantity = quantity + VALUES(quantity),
					shiny_quantity = shiny_quantity + VALUES(shiny_quantity),
					negative_quantity = negative_quantity + VALUES(negative_quantity),
					last_obtained_at = CURRENT_TIMESTAMP
			`,
      [
        cabbageId,
        canonicalCardName,
        normalizedQuantity,
        shinyQuantity,
        negativeQuantity,
      ],
    );
  } catch (error) {
    console.error(`There was an error upserting collected card: ${error}`);
    throw error;
  }
};

export const persistOpenedCards = async (
  cabbageId: number,
  openedCards: OpenedCard[],
): Promise<void> => {
  try {
    const persistedCards = mapOpenedCardsForPersistence(openedCards);

    if (persistedCards.length === 0) {
      return;
    }

    const placeholders = persistedCards
      .map(() => "(?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .join(", ");

    const values = persistedCards.flatMap((card) => [
      cabbageId,
      card.cardName,
      card.quantity,
      card.shinyQuantity,
      card.negativeQuantity,
    ]);

    await pool.execute(
      `
				INSERT INTO CardCollection (
					cabbage_id,
					card_name,
					quantity,
					shiny_quantity,
					negative_quantity,
					last_obtained_at
				)
				VALUES ${placeholders}
				ON DUPLICATE KEY UPDATE
					quantity = quantity + VALUES(quantity),
					shiny_quantity = shiny_quantity + VALUES(shiny_quantity),
					negative_quantity = negative_quantity + VALUES(negative_quantity),
					last_obtained_at = CURRENT_TIMESTAMP
			`,
      values,
    );
  } catch (error) {
    console.error(`There was an error persisting opened cards: ${error}`);
    throw error;
  }
};

type AtomicActionResult = {
  success: boolean;
  error?: string;
};

export const buyPacksAtomic = async (
  cabbageId: number,
  packName: string,
  quantity: number,
  totalCost: number,
): Promise<AtomicActionResult> => {
  const connection = await pool.getConnection();

  try {
    const canonicalPackName = resolvePackName(packName);
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    const normalizedCost = Math.max(0, Math.floor(totalCost));

    await connection.beginTransaction();

    await connection.execute(
      `
				INSERT INTO CardInventory (cabbage_id)
				VALUES (?)
				ON DUPLICATE KEY UPDATE cabbage_id = VALUES(cabbage_id)
			`,
      [cabbageId],
    );

    const [coinRows] = await connection.execute(
      `
				SELECT coins
				FROM CardInventory
				WHERE cabbage_id = ?
				FOR UPDATE
			`,
      [cabbageId],
    );

    const currentCoins =
      Array.isArray(coinRows) && coinRows.length > 0
        ? Number((coinRows[0] as { coins?: number }).coins ?? 0)
        : 0;

    if (currentCoins < normalizedCost) {
      await connection.rollback();
      return { success: false, error: "Not enough coins" };
    }

    await connection.execute(
      `
				UPDATE CardInventory
				SET coins = coins - ?
				WHERE cabbage_id = ?
			`,
      [normalizedCost, cabbageId],
    );

    await connection.execute(
      `
				INSERT INTO CardInventoryPacks (cabbage_id, pack_name, quantity)
				VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE quantity = GREATEST(0, quantity + VALUES(quantity))
			`,
      [cabbageId, canonicalPackName, normalizedQuantity],
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(`There was an error buying packs atomically: ${error}`);
    throw error;
  } finally {
    connection.release();
  }
};

export const openPacksAtomic = async (
  cabbageId: number,
  packName: string,
  quantity: number,
  openedCards: OpenedCard[],
): Promise<AtomicActionResult> => {
  const connection = await pool.getConnection();

  try {
    const canonicalPackName = resolvePackName(packName);
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    const persistedCards = mapOpenedCardsForPersistence(openedCards);

    await connection.beginTransaction();

    await connection.execute(
      `
				INSERT INTO CardInventory (cabbage_id)
				VALUES (?)
				ON DUPLICATE KEY UPDATE cabbage_id = VALUES(cabbage_id)
			`,
      [cabbageId],
    );

    await connection.execute(
      `
				INSERT INTO CardInventoryPacks (cabbage_id, pack_name, quantity)
				VALUES (?, ?, 0)
				ON DUPLICATE KEY UPDATE pack_name = VALUES(pack_name)
			`,
      [cabbageId, canonicalPackName],
    );

    const [packRows] = await connection.execute(
      `
				SELECT quantity
				FROM CardInventoryPacks
				WHERE cabbage_id = ? AND pack_name = ?
				FOR UPDATE
			`,
      [cabbageId, canonicalPackName],
    );

    const currentPackQuantity =
      Array.isArray(packRows) && packRows.length > 0
        ? Number((packRows[0] as { quantity?: number }).quantity ?? 0)
        : 0;

    if (currentPackQuantity < normalizedQuantity) {
      await connection.rollback();
      return { success: false, error: "Not enough packs available." };
    }

    await connection.execute(
      `
				UPDATE CardInventoryPacks
				SET quantity = GREATEST(0, quantity - ?)
				WHERE cabbage_id = ? AND pack_name = ?
			`,
      [normalizedQuantity, cabbageId, canonicalPackName],
    );

    if (persistedCards.length > 0) {
      const placeholders = persistedCards
        .map(() => "(?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
        .join(", ");

      const values = persistedCards.flatMap((card) => [
        cabbageId,
        card.cardName,
        card.quantity,
        card.shinyQuantity,
        card.negativeQuantity,
      ]);

      await connection.execute(
        `
					INSERT INTO CardCollection (
						cabbage_id,
						card_name,
						quantity,
						shiny_quantity,
						negative_quantity,
						last_obtained_at
					)
					VALUES ${placeholders}
					ON DUPLICATE KEY UPDATE
						quantity = quantity + VALUES(quantity),
						shiny_quantity = shiny_quantity + VALUES(shiny_quantity),
						negative_quantity = negative_quantity + VALUES(negative_quantity),
						last_obtained_at = CURRENT_TIMESTAMP
				`,
        values,
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(`There was an error opening packs atomically: ${error}`);
    throw error;
  } finally {
    connection.release();
  }
};

export const generatePacksAtomic = async (
  cabbageId: number,
  packNames: string[],
  quantityPerPack: number,
  coinsToAdd: number,
): Promise<AtomicActionResult> => {
  const connection = await pool.getConnection();

  try {
    const normalizedQuantity = Math.max(1, Math.floor(quantityPerPack));
    const normalizedCoinsToAdd = Math.max(0, Math.floor(coinsToAdd));

    await connection.beginTransaction();

    await connection.execute(
      `
				INSERT INTO CardInventory (cabbage_id)
				VALUES (?)
				ON DUPLICATE KEY UPDATE cabbage_id = VALUES(cabbage_id)
			`,
      [cabbageId],
    );

    if (normalizedCoinsToAdd > 0) {
      await connection.execute(
        `
				UPDATE CardInventory
				SET coins = GREATEST(0, coins + ?)
				WHERE cabbage_id = ?
			`,
        [normalizedCoinsToAdd, cabbageId],
      );
    }

    const packTotals = new Map<string, number>();
    for (const packName of packNames) {
      const canonicalPackName = resolvePackName(packName);
      const currentQuantity = packTotals.get(canonicalPackName) ?? 0;
      packTotals.set(canonicalPackName, currentQuantity + normalizedQuantity);
    }

    const packEntries = Array.from(packTotals.entries());
    if (packEntries.length > 0) {
      const placeholders = packEntries.map(() => "(?, ?, ?)").join(", ");
      const values = packEntries.flatMap(
        ([canonicalPackName, totalQuantity]) => [
          cabbageId,
          canonicalPackName,
          totalQuantity,
        ],
      );

      await connection.execute(
        `
				INSERT INTO CardInventoryPacks (cabbage_id, pack_name, quantity)
				VALUES ${placeholders}
				ON DUPLICATE KEY UPDATE quantity = GREATEST(0, quantity + VALUES(quantity))
			`,
        values,
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error(`There was an error generating packs atomically: ${error}`);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * CREATE TABLE CardInventory (cabbage_id INT PRIMARY KEY, coins INT NOT NULL DEFAULT 0, FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 * CREATE TABLE CardInventoryPacks (id INT AUTO_INCREMENT PRIMARY KEY, cabbage_id INT NOT NULL, pack_name VARCHAR(255) NOT NULL, quantity INT NOT NULL DEFAULT 0, UNIQUE KEY uq_card_inventory_pack (cabbage_id, pack_name), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 * CREATE TABLE CardCollection (id INT AUTO_INCREMENT PRIMARY KEY, cabbage_id INT NOT NULL, card_name VARCHAR(255) NOT NULL, quantity INT NOT NULL DEFAULT 0, shiny_quantity INT NOT NULL DEFAULT 0, negative_quantity INT NOT NULL DEFAULT 0, last_obtained_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_card_collection_card (cabbage_id, card_name), FOREIGN KEY (cabbage_id) REFERENCES CabbageUsers(id) ON DELETE CASCADE);
 */
