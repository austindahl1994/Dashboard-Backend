import { Tile } from "@/types/tile.js";
import { cacheBoard } from "./boardFunctions.js";
import { cacheCompletions } from "./completionFunctions.js";
import { cachePlayers } from "./playerFunctions.js";
import { Player } from "@/types/player.js";

// Update manually once event is going to start? Or could use discord command if need be

const EVENT_STARTED: boolean = true;

// board keys are row number
const boardMap = new Map<number, Tile>();

// player keys are discord_ids
const playersMap = new Map<string, Player>();

// outer map number is team number, inner map number is tile id, array is RSN who have completed that tile by id
const completionsMap = new Map<number, Map<number, Array<string>>>();

export const refreshAllData = async (): Promise<void> => {
  try {
    await cacheBoard();
    await cachePlayers();
    await cacheCompletions();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export { boardMap, playersMap, completionsMap, EVENT_STARTED };
