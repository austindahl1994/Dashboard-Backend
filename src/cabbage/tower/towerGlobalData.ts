import type {
  Adventurer,
  TowerFloor,
  TowerLayoutData,
  ReducedPlacements,
  PlacementsMap,
} from "./towerTypes.ts";
import type { CabbageUser } from "@/types/index.ts";
import {
  ensureAdventurerRowsExist,
  getAdventurerData,
  getFloorData,
} from "./mvc/tower.ts";
import towerLayoutJson from "../../files/tower-layout.json" with { type: "json" };
const towerLayoutData: TowerLayoutData | null =
  towerLayoutJson as TowerLayoutData;

export let adventurerData = new Map<number, Adventurer>();
export let rsnToIdMap = new Map<string, number>();
export let discordIdToIdMap = new Map<string, number>();
export let floorData: PlacementsMap = new Map<number, ReducedPlacements>();
export let towerFloorsData: TowerFloor[] = [];

type SerializedFloorData = Array<{
  floor: number;
  items: string[];
  bosses: string[];
}>;

type TowerCacheSnapshot = {
  playerData: Adventurer[];
  adventurers: Adventurer[];
  towerFloors: TowerFloor[];
};

export const getAllAdventurerData = () => {
  try {
    if (!adventurerData || adventurerData.size === 0) {
      console.log("Adventurer data not initialized");
    }
    return adventurerData;
  } catch (error) {
    console.error(`There was an error getting all adventurers: ${error}`);
    throw error;
  }
};

const initializeAdventurerMaps = async () => {
  try {
    adventurerData.clear();
    rsnToIdMap.clear();
    discordIdToIdMap.clear();

    const newAdventurerData = await getAdventurerData();
    if (!newAdventurerData || newAdventurerData.length === 0) {
      console.log("No adventurer data found to hydrate initial maps");
      return;
    }
    for (const adventurer of newAdventurerData) {
      adventurerData.set(adventurer.id, adventurer);
      rsnToIdMap.set(adventurer.rsn.toLowerCase(), adventurer.id);

      if (adventurer.discordId) {
        discordIdToIdMap.set(adventurer.discordId, adventurer.id);
      }
    }
  } catch (error) {
    console.error(`There was an error initializing adventurer maps: ${error}`);
    throw error;
  }
};

export const initializeTowerData = async () => {
  try {
    towerFloorsData = (await getFloorData()) || [];
    floorData =
      towerLayoutData?.placements?.reduce<PlacementsMap>(
        (accumulator, placement) => {
          const existingFloor = accumulator.get(placement.floor);
          if (existingFloor) {
            placement.items.forEach((item) =>
              existingFloor.items.add(item.toLowerCase()),
            );
          } else {
            accumulator.set(placement.floor, {
              items: new Set(placement.items.map((item) => item.toLowerCase())),
              bosses: placement.tile?.name?.toLowerCase()
                ? [placement.tile.name.toLowerCase()]
                : [],
            });
          }
          return accumulator;
        },
        new Map<number, ReducedPlacements>(),
      ) ?? new Map<number, ReducedPlacements>();

    await ensureAdventurerRowsExist();
    await initializeAdventurerMaps();
    // const allItems = getAllItems();
    // const itemList = Array.from(allItems)
    //   .sort((a, b) => a.localeCompare(b))
    //   .join(", ");
    // console.log(`Tower items: ${itemList}`);
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

// Called either once when client requests tower data, or when a player completes a floor and the data is updated to send out new SSE
export const getRequesterCabbageId = (discordId: string): number | null => {
  return discordIdToIdMap.get(discordId) ?? null;
};

export const buildTowerCacheSnapshot = (
  playerGettingDataId: string,
): TowerCacheSnapshot => {
  const cleanAdventurerData =
    adventurerData.size > 0
      ? Array.from(adventurerData.values()).map((adventurer) => {
          if (adventurer.discordId === playerGettingDataId) {
            return adventurer;
          }
          const { discordId, ...rest } = adventurer;
          return rest;
        })
      : [];

  return {
    playerData: cleanAdventurerData,
    adventurers: cleanAdventurerData,
    towerFloors: towerFloorsData,
  };
};

export const getCachedTowerData = (playerGettingDataId: string) => {
  return buildTowerCacheSnapshot(playerGettingDataId);
};

export const addFirstCompletionToCache = (completion: TowerFloor): void => {
  if (typeof completion.floor !== "number") {
    return;
  }

  const alreadyExists = towerFloorsData.some(
    (entry) => entry.floor === completion.floor,
  );

  if (alreadyExists) {
    return;
  }

  towerFloorsData.unshift(completion);
};

export const isTowerFloorUpdatedCompletion = (
  completion: TowerFloor,
): boolean => {
  return typeof completion.floor === "number";
};

export const upsertAdventurerFromCabbageUser = (user: CabbageUser): void => {
  const existingAdventurer = adventurerData.get(user.id);

  if (existingAdventurer) {
    rsnToIdMap.delete(existingAdventurer.rsn.toLowerCase());

    if (existingAdventurer.discordId) {
      discordIdToIdMap.delete(existingAdventurer.discordId);
    }
  }

  const updatedAdventurer: Adventurer = {
    id: user.id,
    rsn: user.rsn,
    currentFloor: existingAdventurer?.currentFloor ?? 0,
    item: existingAdventurer?.item ?? "",
    discordId: user.discord_id ?? null,
    discordAvatar: user.discord_avatar ?? null,
  };

  adventurerData.set(user.id, updatedAdventurer);
  rsnToIdMap.set(user.rsn.toLowerCase(), user.id);

  if (user.discord_id) {
    discordIdToIdMap.set(user.discord_id, user.id);
  }
};

export const getAllItems = (): Set<string> => {
  try {
    const allItems = new Set<string>();
    for (const reducedPlacement of floorData.values()) {
      for (const item of reducedPlacement.items) {
        allItems.add(item);
      }
    }
    return allItems;
  } catch (error) {
    console.error(`Error getting all items: ${error}`);
    return new Set<string>();
  }
};
