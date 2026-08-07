import { getAllCabbageUsers } from "./mvc/cabbage.ts";
import type { CabbageUser } from "@/types/index.ts";

export let CabbageUsers: CabbageUser[] = [];
export let cabbageUsersByID = new Map<number, CabbageUser>();
export let cabbageUsersByDiscordID = new Map<string, CabbageUser>();
export let cabbageUsersByRSN = new Map<string, CabbageUser>();

export const CABBAGE_DATASET_VERSIONS: Record<string, number> = {
  "Boss.v1.json": 1,
  "Clue.v1.json": 1,
  "Monster.v1.json": 1,
  "Npc.v1.json": 1,
  "PackData.json": 1,
};

// Gets all players and information from CabbageUsers table
const initializeCabbageUsers = async () => {
  try {
    const allUsers = await getAllCabbageUsers();
    CabbageUsers = allUsers;
    cabbageUsersByID.clear();
    cabbageUsersByDiscordID.clear();
    cabbageUsersByRSN.clear();
    for (const user of allUsers) {
      cabbageUsersByID.set(user.id, user);
      cabbageUsersByDiscordID.set(user.discord_id, user);
      cabbageUsersByRSN.set(user.rsn.toLowerCase(), user);
    }
  } catch (error) {
    console.error(`There was an error getting all cabbage users: ${error}`);
    throw error;
  }
};

export const checkForCabbageUser = (
  rsn?: string,
  discordId?: string,
): CabbageUser | undefined => {
  try {
    return (
      cabbageUsersByDiscordID.get(discordId ?? "") ??
      cabbageUsersByRSN.get((rsn ?? "").toLowerCase())
    );
  } catch (error) {
    console.error(`There was an error checking for cabbage user: ${error}`);
    throw error;
  }
};

export const upsertCabbageUserCache = (user: CabbageUser): void => {
  const existingUser = cabbageUsersByID.get(user.id);

  if (existingUser) {
    if (existingUser.discord_id !== user.discord_id) {
      cabbageUsersByDiscordID.delete(existingUser.discord_id);
    }

    const existingRsnKey = existingUser.rsn.toLowerCase();
    const newRsnKey = user.rsn.toLowerCase();
    if (existingRsnKey !== newRsnKey) {
      cabbageUsersByRSN.delete(existingRsnKey);
    }
  }

  const userIndex = CabbageUsers.findIndex((current) => current.id === user.id);
  if (userIndex >= 0) {
    CabbageUsers[userIndex] = user;
  } else {
    CabbageUsers.push(user);
  }

  cabbageUsersByID.set(user.id, user);
  cabbageUsersByDiscordID.set(user.discord_id, user);
  cabbageUsersByRSN.set(user.rsn.toLowerCase(), user);
};

export const initializeGlobalCabbageData = async () => {
  try {
    await initializeCabbageUsers();
  } catch (error) {
    console.error(
      `There was an error initializing global cabbage data: ${error}`,
    );
    throw error;
  }
};
