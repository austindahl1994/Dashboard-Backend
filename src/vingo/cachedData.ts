import { Tile } from "@/types/tile.js";
import { cacheBoard } from "./boardFunctions.js";
import { cacheCompletions } from "./completionFunctions.js";
import { cachePlayers } from "./playerFunctions.ts";
import { Player } from "@/types/player.js";
import { Client } from "@/types/client.ts";

// Update manually once event is going to start? Or could use discord command if need be
export const refreshAllData = async (): Promise<void> => {
  try {
    await cacheBoard();
    // await cachePlayers();
    // await cacheCompletions();
    console.log("Successfully refreshed data");
    console.log(`Board Map:`);
    console.log(boardMap);
    console.log("Players Map:");
    console.log(playersMap);
    console.log("Completions map:");
    console.log(completionsMap);
  } catch (e) {
    console.log(e);
    throw e;
  }
};
const EVENT_STARTED: boolean = true;

// board keys are row number
const boardMap = new Map<number, Tile>();

// player keys are discord_ids
const playersMap = new Map<string, Player>();

// outer map number is team number, inner map number is tile id, array is RSN who have completed that tile by id
const completionsMap = new Map<number, Map<number, Array<string>>>();

let clients: Client[] = [];

// refreshAllData()
//   .then(() => {
//     console.log("Successfully refreshed data");
//     console.log(`Board Map:`);
//     console.log(boardMap);
//     console.log("Players Map:");
//     console.log(playersMap);
// console.log("Completions map:")
// console.log(completionsMap)
//   })
//   .catch((e) => {
//     console.log(`Error refreshing data: ${e}`);
//   });

export { boardMap, playersMap, completionsMap, clients, EVENT_STARTED };
