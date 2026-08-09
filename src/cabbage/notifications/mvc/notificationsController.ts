import type { Response } from "express";
import type { CabbageRequest } from "@/middleware/cabbageMiddleware.ts";
import { getCabbageIdFromRequest, sendError } from "@/cabbageUtilities.ts";
import {
  createNotification,
  getNotificationsForUser,
  acknowledgeNotification,
} from "./notifications.ts";
import {
  cabbageUsersByDiscordID,
  cabbageUsersByID,
  cabbageUsersByRSN,
} from "@/cabbage/cabbage-main/globalCabbage.ts";
import { singleBroadcastSseEvent } from "@/cabbage/cabbage-main/activeUsers.ts";
import { Notification } from "./notifications.ts";
import {
  addGiftRewardsAtomic,
  getInventoryUpdatedSnapshot,
} from "@/cabbage/cards/mvc/cards.ts";

type NotificationTarget = {
  scope?: "all" | "single";
  adventurerId?: string;
  rsn?: string;
  discordId?: string;
};

type NotificationGift = {
  coins?: number;
  raffleTickets?: number;
  raffle_tickets?: number;
  raffleTicketCount?: number;
  packs?: {
    name?: string;
    quantity?: number;
  };
};

const canBroadcastToAll = (role?: string): boolean => {
  return role === "moderator" || role === "admin";
};

const normalizePositiveInteger = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return Math.max(0, Math.floor(parsedValue));
    }
  }

  return 0;
};

const resolveRecipientIds = (target: NotificationTarget): number[] => {
  const scope = target.scope ?? "single";

  if (scope === "all") {
    return Array.from(cabbageUsersByID.keys());
  }

  const recipients = new Set<number>();

  const discordId =
    typeof target.discordId === "string" ? target.discordId.trim() : "";
  if (discordId) {
    const userByDiscord = cabbageUsersByDiscordID.get(discordId);
    if (userByDiscord) {
      recipients.add(userByDiscord.id);
    }
  }

  const adventurerId =
    typeof target.adventurerId === "string" ? target.adventurerId.trim() : "";
  if (adventurerId) {
    const userByAdventurerDiscord = cabbageUsersByDiscordID.get(adventurerId);
    if (userByAdventurerDiscord) {
      recipients.add(userByAdventurerDiscord.id);
    }

    const numericAdventurerId = Number.parseInt(adventurerId, 10);
    if (Number.isInteger(numericAdventurerId) && numericAdventurerId > 0) {
      const userById = cabbageUsersByID.get(numericAdventurerId);
      if (userById) {
        recipients.add(userById.id);
      }
    }
  }

  const rsn =
    typeof target.rsn === "string" ? target.rsn.trim().toLowerCase() : "";
  if (rsn) {
    const userByRsn = cabbageUsersByRSN.get(rsn);
    if (userByRsn) {
      recipients.add(userByRsn.id);
    }
  }

  return Array.from(recipients);
};

const sendInventoryUpdatedSSE = async (cabbageId: number): Promise<void> => {
  const discordId = cabbageUsersByID.get(cabbageId)?.discord_id;
  if (!discordId) {
    return;
  }

  const inventorySnapshot = await getInventoryUpdatedSnapshot(cabbageId);
  singleBroadcastSseEvent(discordId, "inventory.updated", inventorySnapshot);
};

export const createNotificationForUser = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    if (!req.body) {
      return sendError(res, 400, "Missing request body");
    }
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId || cabbageUsersByID.get(cabbageId)?.rsn !== "IronDubzie") {
      return sendError(res, 401, "Unauthorized");
    }

    const type = typeof req.body?.type === "string" ? req.body.type.trim() : "";
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const imageRaw =
      typeof req.body?.image === "string" ? req.body.image.trim() : "";
    const target = (req.body?.target ?? {}) as NotificationTarget;
    const gift = (req.body?.gift ?? {}) as NotificationGift;
    const customMessageRaw =
      typeof req.body?.messageOptions?.customMessage === "string"
        ? req.body.messageOptions.customMessage.trim()
        : "";

    const resolvedTitle = title || message || "Notification";
    const resolvedMessage = customMessageRaw || message;

    // console.log(
    //   `[notifications-post] attempt requesterId=${cabbageId} role=${req.cabbage?.role ?? "unknown"} type=${type || "missing"} scope=${target.scope ?? "single"}`,
    // );

    if (target.scope === "all" && !canBroadcastToAll(req.cabbage?.role)) {
      return sendError(res, 403, "Moderator or admin access required");
    }

    if (!type) {
      return sendError(res, 400, "Missing type");
    }

    if (!resolvedMessage) {
      return sendError(res, 400, "Missing message");
    }

    const recipientIds = resolveRecipientIds(target);
    // console.log(
    //   `[notifications-post] target-resolved scope=${target.scope ?? "single"} recipients=${recipientIds.length}`,
    // );
    if (recipientIds.length === 0) {
      return sendError(res, 404, "No target recipients found");
    }

    const coinsToAdd = normalizePositiveInteger(gift.coins);
    const raffleTicketsToAdd = normalizePositiveInteger(
      gift.raffleTickets ?? gift.raffle_tickets ?? gift.raffleTicketCount,
    );
    const packName =
      typeof gift.packs?.name === "string" ? gift.packs.name.trim() : "";
    const packQuantityToAdd = normalizePositiveInteger(gift.packs?.quantity);

    const shouldApplyGift =
      coinsToAdd > 0 ||
      raffleTicketsToAdd > 0 ||
      (packName.length > 0 && packQuantityToAdd > 0);

    // console.log(
    //   `[notifications-post] gift-summary apply=${shouldApplyGift} coins=${coinsToAdd} raffleTickets=${raffleTicketsToAdd} pack=${packName || "none"} packQty=${packQuantityToAdd}`,
    // );

    if (
      (packName && packQuantityToAdd <= 0) ||
      (!packName && packQuantityToAdd > 0)
    ) {
      return sendError(
        res,
        400,
        "Gift packs must include both name and quantity",
      );
    }

    const createdNotifications: Notification[] = [];

    for (const recipientId of recipientIds) {
      // console.log(
      //   `[notifications-post] recipient-start recipientId=${recipientId}`,
      // );

      if (shouldApplyGift) {
        await addGiftRewardsAtomic(recipientId, {
          coins: coinsToAdd,
          raffleTickets: raffleTicketsToAdd,
          packName: packName || undefined,
          packQuantity: packQuantityToAdd,
        });

        // console.log(
        //   `[notifications-post] recipient-gift-applied recipientId=${recipientId}`,
        // );
      }

      const createdNotification = await createNotification(
        recipientId,
        type,
        resolvedTitle,
        resolvedMessage,
        imageRaw || undefined,
      );

      if (!createdNotification) {
        // console.log(
        //   `[notifications-post] recipient-notification-failed recipientId=${recipientId}`,
        // );
        continue;
      }

      createdNotifications.push(createdNotification);
      sendNotificationSSE(recipientId, createdNotification);

      if (shouldApplyGift) {
        await sendInventoryUpdatedSSE(recipientId);
      }

      // console.log(
      //   `[notifications-post] recipient-complete recipientId=${recipientId} notificationId=${createdNotification.id}`,
      // );
    }

    if (createdNotifications.length === 0) {
      return sendError(res, 500, "Failed to create notification");
    }

    return res.status(201).json({
      notificationsCreated: createdNotifications.length,
      recipientsTargeted: recipientIds.length,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error(`[notifications-post] fatal error: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const getNotifications = async (req: CabbageRequest, res: Response) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }
    const notifications = await getNotificationsForUser(cabbageId);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error(`There was an error getting notifications: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const updateNotification = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);
    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const notificationId = Number.parseInt(req.params.notificationId, 10);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return sendError(res, 400, "Invalid notificationId");
    }

    const acknowledged = await acknowledgeNotification(
      cabbageId,
      notificationId,
    );
    if (!acknowledged) {
      return sendError(res, 404, "Notification not found");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`There was an error updating notification: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const sendNotificationSSE = (id: number, notification: Notification) => {
  try {
    const discordId: string | undefined = cabbageUsersByID.get(id)?.discord_id;
    if (discordId) {
      singleBroadcastSseEvent(discordId, "notification", {
        notification: notification,
      });
    }
  } catch (error) {
    console.log(
      `There was an error attempting to send a notification SSE:`,
      error,
    );
    throw error;
  }
};
