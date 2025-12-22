import { Completion } from "@/types/completion.ts";
import { boardMap, completionsMap, teamPoints } from "./cachedData.ts";

const ROW_POINTS: number = 10;
const COL_POINTS: number = 10;
const BOARD_COMPLETION_POINTS: number = 50;

// Point values for tiles by index, index 0 = 1 etc...
const pointValues: number[] = [1, 2, 3, 5, 8];

// Use cached boardMap and completions to calc points, updates cached teamPoints array
// Add highscores as well?
// NEED TO CALC ROW/COL points and BOARD_COMPLETION points later
export const computePoints = (): void => {
  try {
    if (completionsMap.size === 0) {
      return;
    }
    // Array of point value for each tile in board by tile id - 1
    // [0, 0, 0, 0, 1, 2, 1, 0, etc...]
    const boardToPoints: number[] = [];
    for (const [_, tile] of boardMap) {
      boardToPoints.push(tile.tier - 1);
    }
    // Next iterate through each key in completionsMap and compare tile_id vs boardToPoints for each of the teams completions
    for (const [team, completionsMapByTileID] of completionsMap) {
      let totalPoints: number = 0;
      for (const [id, completions] of completionsMapByTileID) {
      }
    }
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

// Computing rows/cols/board completions
// Create an array for each team that is based on amount of completions for that tile
// Use completionsMap.key().length to create the amount of arrays of numbers
// During point computation for each completion, increment the value at the tile in the array of allCompletions for that team
// After all completions are processed for that team, check each row/col for completions, iterate through the board: Tile, comparing tile.quantity vs total completions for that tile at the same index in the array

// How do we want completion data? Just to be a map of [key: team number, value: array of all complations] or swap the value to be another map, where the inner map key is [key: tile_id, value: array of completions for that tile]?
// Then we can easily check if tile_id completions length === tile.quantity for row/col/board completions
