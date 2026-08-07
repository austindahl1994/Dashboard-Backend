import type { Response } from "express";
import type { CabbageRequest } from "@/middleware/cabbageMiddleware.ts";
import { cabbageUsersByDiscordID } from "@/cabbage/cabbage-main/globalCabbage.ts";
import {
  DEFAULT_PACK_CARD_QUANTITY,
  getAllPackCosts,
  getPackCards,
  getPackPurchaseCost,
  openPack,
} from "../cardProcesses.ts";
import {
  buyPacksAtomic,
  getCardCollection,
  getCardInventory,
  openPacksAtomic,
} from "./cards.ts";

const PACK_QUANTITIES = new Set([1, 5, 10]);

const getCabbageIdFromRequest = (req: CabbageRequest): number | null => {
  const discordId = req.cabbage?.discord_id;

  if (!discordId) {
    return null;
  }

  return cabbageUsersByDiscordID.get(discordId)?.id ?? null;
};

const parseQuantity = (rawValue: unknown, fallback = 1): number => {
  if (typeof rawValue === "number") {
    return Math.floor(rawValue);
  }

  if (typeof rawValue === "string" && rawValue.trim()) {
    return Math.floor(Number(rawValue));
  }

  return fallback;
};

const validatePackQuantity = (quantity: number): boolean => {
  return PACK_QUANTITIES.has(quantity);
};

const sendError = (
  res: Response,
  status: number,
  message: string,
  details?: unknown,
) => {
  return res.status(status).json({
    message,
    error: message,
    ...(details ? { details } : {}),
  });
};

// Controller for getting data for player for inventory, packs quantity, and pack costs, this is all pulled from CardWrapper on frontend
export const getCardInventoryData = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const inventory = await getCardInventory(cabbageId);
    const packCosts = getAllPackCosts();

    return res.json({ inventory, packCosts });
  } catch (error) {
    console.error(`There was an error getting card inventory data: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

// Controller for getting the entire collection for that player, called when player opens collection
export const getPlayerCollection = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const collection = await getCardCollection(cabbageId);
    return res.json({ collection });
  } catch (error) {
    console.error(`There was an error getting card collection: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

// Controller for buying packs, minus the gold, increment that pack type, both dependant if quantity passed in is 1, 5, or 10, ensure player has enough to buy the pack(s)
export const buyPacks = async (req: CabbageRequest, res: Response) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const packName =
      typeof req.body?.packName === "string" ? req.body.packName : "";
    const quantity = parseQuantity(req.body?.quantity, 1);

    if (!packName) {
      return sendError(res, 400, "Missing packName");
    }

    if (!validatePackQuantity(quantity)) {
      return sendError(res, 400, "Quantity must be one of: 1, 5, or 10.");
    }

    const totalCost = getPackPurchaseCost(packName, quantity);
    const buyResult = await buyPacksAtomic(
      cabbageId,
      packName,
      quantity,
      totalCost,
    );

    if (!buyResult.success) {
      return sendError(res, 400, buyResult.error ?? "Buy failed");
    }

    const buyDiscordId = req.cabbage?.discord_id;
    const buyUser = buyDiscordId
      ? cabbageUsersByDiscordID.get(buyDiscordId)
      : undefined;
    console.log(
      `[cards-buy] rsn=${buyUser?.rsn ?? "unknown"} bought ${quantity}x ${packName}`,
    );

    const updatedInventory = await getCardInventory(cabbageId);
    return res.json({
      purchased: {
        packName,
        quantity,
        totalCost,
      },
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error(`There was an error buying packs: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

// Controller for opening packs, first make sure player has the correct pack quantity, then get what cards will be sent back to the frontend, called when a player tries "opening a pack" from the Open Packs page
export const openPacks = async (req: CabbageRequest, res: Response) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const packName =
      typeof req.body?.packName === "string" ? req.body.packName : "";
    const quantity = parseQuantity(req.body?.quantity, 1);

    if (!packName) {
      return sendError(res, 400, "Missing packName");
    }

    if (!validatePackQuantity(quantity)) {
      return sendError(res, 400, "Quantity must be one of: 1, 5, or 10.");
    }

    const possibleCards = getPackCards(packName);
    if (possibleCards.length === 0) {
      return sendError(res, 400, "No cards configured for this pack");
    }

    const openedCards = Array.from({ length: quantity }).flatMap(() =>
      openPack(possibleCards, DEFAULT_PACK_CARD_QUANTITY),
    );

    const openResult = await openPacksAtomic(
      cabbageId,
      packName,
      quantity,
      openedCards,
    );

    if (!openResult.success) {
      return sendError(res, 400, openResult.error ?? "Open failed");
    }

    const openDiscordId = req.cabbage?.discord_id;
    const openUser = openDiscordId
      ? cabbageUsersByDiscordID.get(openDiscordId)
      : undefined;
    const firstPackCards = openedCards.slice(0, DEFAULT_PACK_CARD_QUANTITY);
    const firstPackCardSummary = firstPackCards
      .map((card) => `${card.name}(${card.finish})`)
      .join(", ");
    const extraCardsCount = Math.max(
      0,
      openedCards.length - firstPackCards.length,
    );

    console.log(
      `[cards-open] rsn=${openUser?.rsn ?? "unknown"} opened ${quantity}x ${packName} cards=${firstPackCardSummary}${extraCardsCount > 0 ? ` | extraCards=${extraCardsCount}` : ""}`,
    );

    const updatedInventory = await getCardInventory(cabbageId);

    return res.json({
      packName,
      packsOpened: quantity,
      cardsPerPack: DEFAULT_PACK_CARD_QUANTITY,
      openedCards,
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error(`There was an error opening packs: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

/*
export const generatePack = async (req: CabbageRequest, res: Response) => {
  // Disabled per request: generate flow was test-only.
  return sendError(res, 410, "Generate endpoint disabled.");
};
*/
