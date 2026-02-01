import { Completion, SimpleCompletion } from "@/types/completion.ts";
import { Team } from "@/types/teams.ts";
import {
  boardMap,
  completionsMap,
  teamPoints,
  teamStates,
} from "./cachedData.ts";

const GRID_SIZE: number = 10;
const ROW_POINTS: number = 10;
const COL_POINTS: number = 10;

const REQUIRED_ROW_COUNT: number[] = Array(GRID_SIZE).fill(0);
const REQUIRED_COL_COUNT: number[] = Array(GRID_SIZE).fill(0);

// Point values for tiles by index, index 0 = 1 etc...
const POINT_VALUES: number[] = [1, 2, 3, 5, 8];

// --------------------- INITIAL ------------------------
export const createTeamStates = (numberOfTeams: number): void => {
  try {
    // Fill with three temp teamstates
    teamStates.clear();
    for (let t = 1; t <= numberOfTeams; t++) {
      const teamState: Team = {
        teamNumber: t,
        tileCounts: new Map(),
        completedTiles: new Set(),
        rowCounts: Array(10).fill(0),
        colCounts: Array(10).fill(0),
        completedRows: new Set(),
        completedCols: new Set(),
        tilePoints: 0,
      };
      teamStates.set(t, teamState);
    }
    const boardRequirements: Map<number, number> = new Map();

    for (const [id, tile] of boardMap) {
      boardRequirements.set(id, tile.quantity);
      const rowCalc = Math.floor(id / GRID_SIZE);
      const colCalc = id % GRID_SIZE;
      REQUIRED_ROW_COUNT[rowCalc] += tile.quantity;
      REQUIRED_COL_COUNT[colCalc] += tile.quantity;
    }

    // console.log(`Updating team states now`);
    for (const [teamNumber, teamCompletions] of completionsMap) {
      updateTeamStates(
        teamStates.get(teamNumber)!,
        teamCompletions,
        boardRequirements,
      );
    }
    // Need to calc initial points after creating team states
    for (const state of teamStates.values()) {
      calcFinalTeamPoints(state);
    }
  } catch (error) {
    console.log(`calcInitialPoints: Error computing initial points: ${error}`);
    throw error;
  }
};

// Calc individual tile points and adds completed tiles to team state sets for later use on rows/cols
const updateTeamStates = (
  teamState: Team,
  teamCompletions: Map<number, SimpleCompletion[]>,
  boardReqs: Map<number, number>,
): void => {
  try {
    // Updates tile points and completed tiles set
    // console.log(`Team number for update: ${teamState.teamNumber}`);
    for (const [id, completionArr] of teamCompletions) {
      const requiredQty = boardReqs.get(id);
      // console.log(
      //   `For tile id: ${id}, number of completions: ${completionArr.length} found, required quantity: ${requiredQty}`,
      // );
      if (requiredQty && completionArr.length >= requiredQty) {
        const tile = boardMap.get(id);
        // console.log(
        //   `Tile found and need to update teamState for tile id: ${id} since completions meet/exceed required quantity`,
        // );
        if (tile) {
          const tilePoints = POINT_VALUES[tile.tier - 1];
          // console.log(
          //   `Points that should be added to team: ${teamState.teamNumber} are: ${tilePoints}`,
          // );
          teamState.tilePoints += tilePoints;
          teamState.completedTiles.add(id);
          // console.log(
          //   `After adding that tile to completed tiles, all completed tiles are:`,
          // );
          // console.log(teamState.completedTiles);
        }
      }
    }

    // passed in a set of ids (1, 7, 8, 26, etc..)
    // so for an id of 7, row = Math.floor(7/10) = 0, col = 7%10 = 7, increment rowCounts[0] and colCounts[7]
    // results in rowCounts = [1,0,0,0,0,0,0,0,0,0], colCounts = [0,0,0,0,0,0,0,1,0,0]
    for (const tileId of teamState.completedTiles) {
      const rowCalc = Math.floor(tileId / GRID_SIZE);
      const colCalc = tileId % GRID_SIZE;
      teamState.rowCounts[rowCalc]++; //updates the counter for row at that index
      teamState.colCounts[colCalc]++; //updates the counter for col at that index
    }
    // Now check for completed rows and cols, add points accordingly
    Array.from({ length: GRID_SIZE }, (_, i) => i).forEach((index) => {
      if (teamState.rowCounts[index] >= REQUIRED_ROW_COUNT[index]) {
        teamState.completedRows.add(index);
      }
      if (teamState.colCounts[index] >= REQUIRED_COL_COUNT[index]) {
        teamState.completedCols.add(index);
      }
    });
  } catch (error) {
    console.log(`calcIndTiles: error calcing tiles: ${error}`);
    throw error;
  }
};

// --------------------- INCREMENTAL ------------------------
// Incremental completion computations, have state as a global object created at server start or during refresh cache discord command
export const addCompletionToTeamState = (completedTile: Completion) => {
  try {
    // console.log(`Trying to add completion for team states, passed in data:`);
    // console.log(completedTile);
    const teamState = teamStates.get(completedTile.team);
    if (!teamState) {
      throw new Error(
        `addCompletionToTeamState: No team state found for team ${completedTile.team}`,
      );
    }
    // console.log(`Found teamstate from data: `);
    // console.log(teamState);
    if (teamState.completedTiles.has(completedTile.tile_id)) {
      console.log(
        `addCompletionToTeamState: Tile completion was sent to teamstate but not needed for data:`,
      );
      console.log(completedTile);
      return; // Tile already completed, no need to update
    }

    // Get tile and ensure it exists
    const tile = boardMap.get(completedTile.tile_id);

    if (!tile)
      throw new Error(
        `Tile with ID ${completedTile.tile_id} not found in boardMap`,
      );

    // Need to add the completion to the completedTiles set if now completed (completion count >= quantity)
    const requiredQty = tile.quantity;
    const teamMap = completionsMap.get(completedTile.team);
    if (!teamMap)
      throw new Error(`No completions found for team ${completedTile.team}`);

    // completionCount exist [[] []] AFTER the new completion was added, length = 2, if requiredQty = 3, not completed
    // completionCount === requiredQty should only happen once, seeing as we check if already completed at start of function AND we check when dink data is passed in, after verifying item and sources match
    const completionCount = teamMap.get(completedTile.tile_id)?.length || 0;
    if (completionCount !== requiredQty) {
      console.log(
        `Completion count does not equal required quantity, will not update team state`,
      );
      return;
    }

    teamState.completedTiles.add(completedTile.tile_id);

    // Need to add tier of tile to tilePoints after guaranteeing tile is ACTUALLY COMPLETED
    const tier = tile.tier;
    if (!tier)
      throw new Error(
        `Tile tier not found for tile ID ${completedTile.tile_id}`,
      );

    teamState.tilePoints += POINT_VALUES[tier - 1];

    // Need to add the completion to rowCounts and colCounts
    const compRowIndex = Math.floor(completedTile.tile_id / GRID_SIZE);
    const compColIndex = completedTile.tile_id % GRID_SIZE;
    teamState.rowCounts[compRowIndex]++;
    teamState.colCounts[compColIndex]++;

    // Need to check if row or col is now completed, if so add to completedRows/Cols sets
    if (teamState.rowCounts[compRowIndex] >= REQUIRED_ROW_COUNT[compRowIndex]) {
      teamState.completedRows.add(compRowIndex);
    }

    if (teamState.colCounts[compColIndex] >= REQUIRED_COL_COUNT[compColIndex]) {
      teamState.completedCols.add(compColIndex);
    }

    // Finally re-calc final team points
    // console.log(`Finished adding team to state, result: `);
    // console.log(teamState);
    calcFinalTeamPoints(teamState);
  } catch (error) {
    console.log(
      `addCompletionToTeamState: Error adding completion to team state: ${error}`,
    );
    throw error;
  }
};

const calcFinalTeamPoints = (teamState: Team): void => {
  // console.log(`Passed in team number: ${teamState.teamNumber}`);
  let totalPoints = teamState.tilePoints;
  totalPoints += teamState.completedRows.size * ROW_POINTS;
  totalPoints += teamState.completedCols.size * COL_POINTS;
  teamPoints.set(teamState.teamNumber, totalPoints);
};

// --------------------- HIGHSCORES ------------------------
