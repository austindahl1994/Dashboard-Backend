import { singleBroadcastSseEvent } from "@/cabbage/cabbage-main/activeUsers.ts";
import {
  addGiftRewardsAtomic,
  getInventoryUpdatedSnapshot,
} from "@/cabbage/cards/mvc/cards.ts";
import { createNotification } from "./mvc/notifications.ts";

type FloorRewardConfig = {
  floor: number;
  coins: number;
  raffleTickets: number;
  packName: string;
  packQuantity: number;
};

const MILESTONE_FLOOR_REWARDS: FloorRewardConfig[] = [
  {
    floor: 24,
    coins: 5000,
    raffleTickets: 1,
    packName: "Chambers of Xeric",
    packQuantity: 3,
  },
  {
    floor: 34,
    coins: 10000,
    raffleTickets: 2,
    packName: "Tombs of Amascut",
    packQuantity: 4,
  },
  {
    floor: 49,
    coins: 15000,
    raffleTickets: 3,
    packName: "Theatre of Blood",
    packQuantity: 5,
  },
];

type FloorRewardInput = {
  cabbageId: number;
  rsn: string;
  floorNumber: number;
  discordId?: string | null;
};

export const processFloor24RewardNotification = async ({
  cabbageId,
  rsn,
  floorNumber,
  discordId,
}: FloorRewardInput): Promise<boolean> => {
  const rewardConfig = MILESTONE_FLOOR_REWARDS.find(
    (reward) => reward.floor === floorNumber,
  );

  if (!rewardConfig) {
    return false;
  }

  await addGiftRewardsAtomic(cabbageId, {
    coins: rewardConfig.coins,
    raffleTickets: rewardConfig.raffleTickets,
    packName: rewardConfig.packName,
    packQuantity: rewardConfig.packQuantity,
  });

  const title = `Floor ${rewardConfig.floor} reward unlocked`;
  const ticketLabel = rewardConfig.raffleTickets === 1 ? "ticket" : "tickets";
  const message =
    `Great work ${rsn}. You received ` +
    `${rewardConfig.packQuantity} ${rewardConfig.packName} packs, ` +
    `${rewardConfig.coins} coins, and ${rewardConfig.raffleTickets} raffle ${ticketLabel}.`;

  const notification = await createNotification(
    cabbageId,
    "gift",
    title,
    message,
    "/CardPack.png",
  );

  if (!notification) {
    console.error(
      `[tower-floor-reward] failed to create notification for cabbageId=${cabbageId} floor=${rewardConfig.floor}`,
    );
    return false;
  }

  if (discordId) {
    singleBroadcastSseEvent(discordId, "notification", {
      notification,
    });

    const inventorySnapshot = await getInventoryUpdatedSnapshot(cabbageId);
    singleBroadcastSseEvent(discordId, "inventory.updated", inventorySnapshot);
  }

  console.log(
    `[tower-floor-reward] granted rsn=${rsn} cabbageId=${cabbageId} floor=${rewardConfig.floor} coins=+${rewardConfig.coins} raffleTickets=+${rewardConfig.raffleTickets} pack=${rewardConfig.packName}x${rewardConfig.packQuantity}`,
  );

  return true;
};
