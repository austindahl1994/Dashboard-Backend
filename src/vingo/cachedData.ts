import { Tile } from "@/types/tile.js";
import { cacheBoard } from "./board.js";
import { cacheCompletions } from "./completions.ts";
import { cachePlayers } from "./players.ts";
import { Player } from "@/types/player.js";
// import { Client } from "@/types/client.ts";
import { Completion, SimpleCompletion } from "@/types/completion.ts";
import { computePoints } from "./points.ts";

// Update manually once event is going to start? Or could use discord command if need be
export const refreshAllData = async (): Promise<void> => {
  try {
    await cacheBoard();
    await cachePlayers();
    await cacheCompletions();
    computePoints();
    console.log("Successfully refreshed data");
    // console.log(`Board Map:`);
    // console.log(boardMap);
    console.log("Players Map:");
    console.log(playersMap);
    console.log("Completions map:");
    console.log(completionsMap);
    console.log(`Team points: `);
    console.log(teamPoints);
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

// Map number is team, Completion[] is array of completions for that team
const completionsMap = new Map<number, Map<number, SimpleCompletion[]>>();

// Points are listed by team number index-1 Ex. [28, 78, 23]
const teamPoints: number[] = [0, 0, 0];

// Top 5 players per team by points [[team1 top 5], [t2], [t3]]
const highscores: number[][] = [[], [], []];

export { boardMap, playersMap, completionsMap, teamPoints, EVENT_STARTED };

// Use if adding SSE
// let clients: Client[] = [];

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
