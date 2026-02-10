// import { Client } from "@/types/client.ts";
import { Tile } from "@/types/tile.js";
import { cacheBoard } from "./board.js";
import { cacheCompletions } from "./completions.ts";
import { cachePlayers, getNumberOfTeams } from "./players.ts";
import { Player } from "@/types/player.js";
import { SimpleCompletion } from "@/types/completion.ts";
import { Team } from "@/types/teams.ts";
import { createTeamStates } from "./points.ts";
// import { computePoints } from "./points.ts";
import dotenv from "dotenv";
import { createCachedShameCounts } from "./shame.ts";
dotenv.config();

// Update manually once event is going to start? Or could use discord command if need be
export const refreshAllData = async (): Promise<void> => {
  try {
    await cacheBoard();
    await cachePlayers();
    const teamNumber: number = getNumberOfTeams();
    await cacheCompletions();
    createTeamStates(teamNumber);
    // computePoints();
    console.log("Successfully refreshed data");
    // console.log(`Board Map:`);
    // console.log(boardMap);
    // console.log("Players Map:");
    // console.log(playersMap);
    // console.log("Completions map:");
    // for (const [team, innerMap] of completionsMap) {
    //   console.log(`Team ${team}:`);
    //   if (innerMap && innerMap.size > 0) {
    //     for (const [tileId, completions] of innerMap) {
    //       console.log(`  Tile ${tileId}:`, completions);
    //     }
    //   } else {
    //     console.log("  (no completions cached)");
    //   }
    // }
    // console.log(`Team points: `);
    // console.log(teamPoints);
    // console.log(`Team States:`);
    // console.log(teamStates);
    await createCachedShameCounts();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const EVENT_STARTED: boolean = false;

// board keys are row number
// Swapping keys from being row numbers to tile IDs for easier access when computing completions
export const boardMap = new Map<number, Tile>();

// player keys are discord_ids
export const playersMap = new Map<string, Player>();

// Map number is team, Completion[] is array of completions for that team
export const completionsMap = new Map<
  number,
  Map<number, SimpleCompletion[]>
>();

// Points are listed by team number index-1 Ex. [28, 78, 23]
export const teamPoints: Map<number, number> = new Map<number, number>();

// cached deaths or just use a call from frontend to get all deaths from shame table?
// const deaths = new Map<string, number>();

// Top 5 players per team by points [[team1 top 5], [t2], [t3]]
export const highscores: number[][] = [[], [], []];
export const teamShameMap: Map<number, number> = new Map<number, number>();
export const teamStates: Map<number, Team> = new Map<number, Team>();

export const allPlayers = [];
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
