import type { Adventurer, Dink, Items, TowerFloor } from "@/types/index.ts";
import {
  addFirstCompletionToCache,
  adventurerData,
  buildTowerCacheSnapshot,
  discordIdToIdMap,
  floorData,
  rsnToIdMap,
  upsertAdventurerFromCabbageUser,
} from "./towerGlobalData.ts";
import { checkForCabbageUser } from "../cabbage-main/globalCabbage.ts";
import { displayTime } from "@/Utilities.js";
import {
  addFirstTowerFloorCompletion,
  addTowerCompletion,
  getCompletionsById,
  upsertAdventurerProgress,
} from "./mvc/tower.ts";
import {
  broadcastSseEventPerUser,
  singleBroadcastSseEvent,
} from "../cabbage-main/activeUsers.ts";
import { streamUpload } from "@/services/aws/s3.js";
import { completionBroadcast } from "../../bot/broadcasts/completionBroadcast.js";
import { towerCompletion } from "../../bot/embeds/cabbage/completion.js";

// Compare RSN with globalTowerData, will return either adventurer ID or false
const comparePlayer = (
  rsn: string,
  discordId: string | null = null,
): number | false => {
  try {
    const rsnExists = compareRSN(rsn);
    if (rsnExists) {
      return rsnExists; //RSN Matches, so return Adventurer ID
    }
    if (discordId && !rsnExists) {
      return compareDiscordId(discordId); //No RSN match, try with discord data
    }
    return false;
  } catch (error) {
    console.error(`There was an error comparing player: ${error}`);
    throw error;
  }
};

const compareRSN = (rsn: string): number | false => {
  try {
    return rsnToIdMap.get(rsn.toLowerCase()) ?? false;
  } catch (error) {
    console.error(`There was an error matching RSN: ${error}`);
    throw error;
  }
};

const compareDiscordId = (discordId: string): number | false => {
  try {
    return discordIdToIdMap.get(discordId) ?? false;
  } catch (error) {
    console.error(`There was an error matching Discord ID: ${error}`);
    throw error;
  }
};

const buildCompletionUploadKey = (
  rsn: string,
  floorNumber: number,
  items: Items[] | undefined,
) => {
  const itemLabel =
    items
      ?.map((item) => item.name.trim())
      .filter(Boolean)
      .join("_") || "completion";

  return `TowerOfTrials/Completions/${rsn}/${floorNumber}/${itemLabel}_${Date.now()}.png`;
};

const getResolvedPlayerId = (dinkData: Dink): number => {
  const cachedPlayerId = comparePlayer(
    dinkData.playerName,
    dinkData?.discordUser?.id ?? null,
  );

  if (cachedPlayerId) {
    return cachedPlayerId;
  }

  const cabbageUser = checkForCabbageUser(
    dinkData.playerName,
    dinkData?.discordUser?.id ?? undefined,
  );

  if (!cabbageUser) {
    console.log(`Where did this fucker come from: ${dinkData.playerName}`);
    throw new Error(
      `Cabbage user not found for player: ${dinkData.playerName}`,
    );
  }

  displayTime();
  console.log(
    `Cabbage user found but not in adventurer data: ${dinkData.playerName}`,
  );

  upsertAdventurerFromCabbageUser(cabbageUser);
  return cabbageUser.id;
};

const isDuplicateEntryError = (error: unknown): boolean => {
  const mysqlError = error as { code?: string };
  return mysqlError.code === "ER_DUP_ENTRY";
};

const updateAdventurerCacheProgress = (
  cabbageId: number,
  nextCurrentFloor: number,
  item: string,
) => {
  const adventurer = adventurerData.get(cabbageId);
  if (!adventurer) {
    return;
  }

  adventurer.currentFloor = Math.max(adventurer.currentFloor, nextCurrentFloor);
  adventurer.item = item;
  adventurerData.set(cabbageId, adventurer);
};

const getCompletionItem = (items: Items[] | undefined): string => {
  const completionItem =
    items
      ?.map((item) => item.name.trim())
      .filter(Boolean)
      .join(", ") ?? "";

  return completionItem;
};

type ManualSubmissionPayload = {
  rsn: string;
  discordId?: string | null;
  item?: string | { name: string } | null;
  floor?: number | null;
};

const getResolvedPlayerIdFromIdentity = (
  rsn: string,
  discordId?: string | null,
): number => {
  const cachedPlayerId = comparePlayer(rsn, discordId ?? null);

  if (cachedPlayerId) {
    return cachedPlayerId;
  }

  const cabbageUser = checkForCabbageUser(rsn, discordId ?? undefined);

  if (!cabbageUser) {
    console.log(`Where did this fucker come from: ${rsn}`);
    throw new Error(`Cabbage user not found for player: ${rsn}`);
  }

  displayTime();
  console.log(`Cabbage user found but not in adventurer data: ${rsn}`);

  upsertAdventurerFromCabbageUser(cabbageUser);
  return cabbageUser.id;
};

const getManualCompletionItem = (
  item: ManualSubmissionPayload["item"],
): string => {
  if (typeof item === "string") {
    return item.trim();
  }

  if (item && typeof item === "object" && typeof item.name === "string") {
    return item.name.trim();
  }

  return "";
};

export const processManualTowerSubmission = async (
  image: Buffer,
  mimetype: string,
  payload: ManualSubmissionPayload,
) => {
  try {
    if (!payload?.rsn) {
      throw new Error("Missing RSN for manual tower submission.");
    }

    const completionItem = getManualCompletionItem(payload.item);
    if (!completionItem) {
      throw new Error("Missing completion item for manual tower submission.");
    }

    const playerId = getResolvedPlayerIdFromIdentity(
      payload.rsn,
      payload.discordId,
    );
    const adventurer = adventurerData.get(playerId);

    if (!adventurer) {
      throw new Error(`Adventurer cache missing for cabbageId ${playerId}`);
    }

    const floorNumber =
      typeof payload.floor === "number"
        ? payload.floor
        : adventurer.currentFloor;

    const uploadKey = buildCompletionUploadKey(adventurer.rsn, floorNumber, [
      { name: completionItem },
    ]);
    const playerURL = await streamUpload(uploadKey, image, mimetype);

    if (!playerURL) {
      throw new Error("Completion URL could not be resolved.");
    }

    let isFirstFloorCompletion = false;

    try {
      await addFirstTowerFloorCompletion(playerId, floorNumber, playerURL);
      isFirstFloorCompletion = true;
      addFirstCompletionToCache({
        cabbageId: playerId,
        floor: floorNumber,
        rsn: adventurer.rsn,
        url: playerURL,
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        console.log(
          `Floor ${floorNumber} already has a first completion; continuing with player completion history.`,
        );
      } else {
        throw error;
      }
    }

    await addTowerCompletion(
      playerId,
      floorNumber,
      playerURL,
      completionItem,
      false,
    );

    const nextCurrentFloor = floorNumber + 1;
    await upsertAdventurerProgress(playerId, nextCurrentFloor, completionItem);
    updateAdventurerCacheProgress(playerId, nextCurrentFloor, completionItem);

    const embed = towerCompletion(
      adventurer.rsn,
      floorNumber,
      playerURL,
      isFirstFloorCompletion,
      completionItem,
    );

    try {
      await completionBroadcast(embed);
    } catch (error) {
      console.error(`Tower completion broadcast failed: ${error}`);
    }

    await broadcastTowerUpdates(
      payload.discordId ?? adventurer.discordId,
      playerId,
      isFirstFloorCompletion,
    );

    return {
      isFirstFloorCompletion,
      floorNumber,
      playerURL,
    };
  } catch (error) {
    console.log(`Error processing manual tower submission: ${error}`);
    throw error;
  }
};

const broadcastTowerUpdates = async (
  playerDiscordId: string | null | undefined,
  cabbageId: number,
  shouldBroadcastTowerState: boolean,
) => {
  broadcastSseEventPerUser("tower-state", (user) => ({
    ...buildTowerCacheSnapshot(user.discordId),
    towerFloorsUpdated: shouldBroadcastTowerState,
  }));

  if (playerDiscordId) {
    const completions = await getCompletionsById(cabbageId);
    singleBroadcastSseEvent(playerDiscordId, "tower-completions", {
      cabbageId,
      completions,
    });
  }
};

export const persistTowerCompletion = async (
  cabbageId: number,
  floor: number,
  url: string,
  item: string,
): Promise<boolean> => {
  await addTowerCompletion(cabbageId, floor, url, item);

  let isFirstFloorCompletion = false;

  try {
    await addFirstTowerFloorCompletion(cabbageId, floor, url);
    isFirstFloorCompletion = true;
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      console.log(
        `Floor ${floor} already has a first completion; continuing with player completion history.`,
      );
    } else {
      throw error;
    }
  }

  const nextCurrentFloor = floor + 1;
  await upsertAdventurerProgress(cabbageId, nextCurrentFloor, item);
  updateAdventurerCacheProgress(cabbageId, nextCurrentFloor, item);

  return isFirstFloorCompletion;
};

// If player exists, check floor for what items are needed and return the matching item.
const getMatchingFloorItem = (
  items: Items[] | undefined,
  floor: number,
): string | null => {
  try {
    const floorItems = floorData.get(floor)?.items;
    if (!floorItems) {
      throw new Error(`No items found for floor ${floor}`);
    }
    const matchingItem = items?.find((item) =>
      floorItems.has(item.name.trim().toLowerCase()),
    );
    return matchingItem?.name.trim() ?? null;
  } catch (error) {
    console.error(`There was an error checking floor ${floor}: ${error}`);
    throw error;
  }
};
// Items dont match, return

// Items do match, check to see if floor completed already, save image to S3, returns URL for next steps
// If floor first completion not already completed in TowerFloors table, then add that user to TowerFloors table with S3 URL
export const processNewFloorCompletion = async (
  cabbageId: number,
  floorNumber: number,
  playerURL: string,
  item: string,
  rsn: string,
  discordId?: string | null,
) => {
  try {
    await addTowerCompletion(cabbageId, floorNumber, playerURL, item);

    let isFirstFloorCompletion = false;

    try {
      await addFirstTowerFloorCompletion(cabbageId, floorNumber, playerURL);
      isFirstFloorCompletion = true;
      addFirstCompletionToCache({
        cabbageId,
        floor: floorNumber,
        rsn,
        url: playerURL,
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) {
        console.log(
          `Floor ${floorNumber} already has a first completion; continuing with player completion history.`,
        );
      } else {
        throw error;
      }
    }

    const nextCurrentFloor = floorNumber + 1;
    await upsertAdventurerProgress(cabbageId, nextCurrentFloor, item);
    updateAdventurerCacheProgress(cabbageId, nextCurrentFloor, item);
    const embed = towerCompletion(
      rsn,
      floorNumber,
      playerURL,
      isFirstFloorCompletion,
      item,
    );

    // Do not fail a valid completion if Discord broadcasting errors.
    try {
      await completionBroadcast(embed);
    } catch (error) {
      console.error(`Tower completion broadcast failed: ${error}`);
    }

    await broadcastTowerUpdates(discordId, cabbageId, isFirstFloorCompletion);
    return isFirstFloorCompletion;
  } catch (error) {
    console.error(`There was an error processing tower completion: ${error}`);
    throw error;
  }
};
// Floor completed already - increment currentFloor for player:
// -- in database
// -- cached data in memory
// add url to TowerCompletions table
export const processExistingFloorCompletion = async (
  cabbageId: number,
  floorNumber: number,
  item: string,
  url: string,
  discordId?: string | null,
) => {
  try {
    await addTowerCompletion(cabbageId, floorNumber, url, item);

    const nextCurrentFloor = floorNumber + 1;
    await upsertAdventurerProgress(cabbageId, nextCurrentFloor, item);
    updateAdventurerCacheProgress(cabbageId, nextCurrentFloor, item);

    await broadcastTowerUpdates(discordId, cabbageId, false);
  } catch (error) {
    console.error(
      `There was an error processing existing tower completion: ${error}`,
    );
    throw error;
  }
};

// Sends SSE to all players with global adventurerData (minus discordId unless matches for player who got completion), and all TowerCompletions

export const checkCompletion = async (
  image: Buffer,
  mimetype: string,
  DinkData: Dink,
  url?: string,
  firstImplementation = true,
) => {
  try {
    let playerURL: string | undefined;
    const items = DinkData.extra?.items;

    if (!items || items.length === 0) {
      console.log(`No items found in dink data for ${DinkData.playerName}`);
      return;
    }

    // 1. Check for player, if so, will have floor
    const playerID = getResolvedPlayerId(DinkData);
    const adventurer = adventurerData.get(playerID);

    if (!adventurer) {
      throw new Error(`Adventurer cache missing for cabbageId ${playerID}`);
    }

    const floorNumber = adventurer.currentFloor;

    //2. Player exists, check against floor items, If floorItems for player's current floor match the passed in data, either:
    const matchingItem = getMatchingFloorItem(items, floorNumber);

    if (!matchingItem) {
      console.log(
        `Items for ${DinkData.playerName} did not match requirements for floor ${floorNumber}`,
      );

      if (DinkData.extra?.party && firstImplementation) {
        for (const partyMember of DinkData.extra.party) {
          if (partyMember.toLowerCase() === DinkData.playerName.toLowerCase()) {
            continue;
          }

          await checkCompletion(
            image,
            mimetype,
            {
              ...DinkData,
              playerName: partyMember,
              discordUser: undefined,
            },
            undefined,
            false,
          );
        }
      }

      return;
    }

    // 2a. If URL exists already from the url parameters passed into function, use this as AWS S3 URL since it could have come from the player who got the drop in the party that was checked first
    if (url) {
      playerURL = url;
    }
    // 2b. should create an AWS S3 url for the image for bucketPath/TowerOfTrials/Completions/PlayerName/FloorNumber/ItemName_DateTimeStamp.png
    else {
      const uploadKey = buildCompletionUploadKey(adventurer.rsn, floorNumber, [
        { name: matchingItem },
      ]);
      playerURL = await streamUpload(uploadKey, image, mimetype);
    }

    if (!playerURL) {
      throw new Error("Completion URL could not be resolved.");
    }

    const completionItem = matchingItem;

    // 3, 4, 5. Persist completion history, attempt first-floor completion, and update cache/db progress.
    await processNewFloorCompletion(
      playerID,
      floorNumber,
      playerURL,
      completionItem,
      adventurer.rsn,
      adventurer.discordId,
    );

    // 6. Send SSE to all players with adventurerData and TowerCompletions data, but only send discordId for the player who got the completion, otherwise send null for discordId for all other players

    // 7. Send SSE to specific player with all of their completions, to update allCompletions data on the frontend for that players personal completions

    // 8. If firstImplementation is true, then check for team drop, otherwise don't check for team drop since it will cause an infinite loop of checking the same players again and again
    // 8a. if dinkData.extra.party exists, then foreach player in dinkData.extra.party, check for completion with the same image and mimetype, but with firstImplementation set to false, so that it doesn't check for team drop again
    if (DinkData.extra?.party && firstImplementation) {
      for (const partyMember of DinkData.extra.party) {
        if (partyMember.toLowerCase() === DinkData.playerName.toLowerCase()) {
          continue;
        }

        await checkCompletion(
          image,
          mimetype,
          {
            ...DinkData,
            playerName: partyMember,
            discordUser: undefined,
          },
          playerURL,
          false,
        );
      }
    }

    // 8c. If dinkData.extra.party doesn't exist, then don't check for team drop, just return so the image can be deleted
  } catch (error) {
    console.log(`Error checking completion: ${error}`);
    throw error;
  }
};

// ------- If card packs implemented - IGNORE THIS FOR NOW ------
// Card pack note for that location: // GIVE PLAYER PACKS/GP BASED ON WHAT CONTENT DONE, ADD A SLAYER PACK? NEED TO UPDATE CARD PACK COST IF USED THEN
