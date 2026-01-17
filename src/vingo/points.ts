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
export const createTeamStates = (): void => {
  try {
    // SHOULD NOT MATTER ANYMORE, IF IT DOESNT EXIST IT CREATES WHEN CHECKING
    // Ensure we have team placeholders when no completions are cached
    // if (completionsMap.size === 0) {
    //   for (let t = 1; t <= 3; t++) {
    //     const newCompletion = new Map<number, SimpleCompletion[]>();
    //     const exmapleCompletionData: SimpleCompletion[] = [
    //       {
    //         rsn: "Testuser",
    //         item: "Test Item",
    //         url: "https://cabbage-bounty.s3.us-east-2.amazonaws.com/shame/GIMP+Yzero1768659844812",
    //       },
    //     ];
    //     // random number is the tile id
    //     newCompletion.set(
    //       Math.floor(Math.random() * 10),
    //       exmapleCompletionData,
    //     );
    //     completionsMap.set(t, newCompletion);
    //   }
    // }

    // Reset any existing teamStates so repeated calls don't duplicate entries
    teamStates.length = 0;
    for (const keys of completionsMap.keys()) {
      const teamState: Team = {
        tileCounts: new Map(),
        completedTiles: new Set(),
        rowCounts: Array(10).fill(0),
        colCounts: Array(10).fill(0),
        completedRows: new Set(),
        completedCols: new Set(),
        tilePoints: 0,
      };
      teamStates.push(teamState);
    }
    // Create board req map for number of required tile completions for each tile AND array for row/col totals
    const boardRequirements: Map<number, number> = new Map();

    for (const [id, tile] of boardMap) {
      boardRequirements.set(id, tile.quantity);
      const rowCalc = Math.floor(id / GRID_SIZE);
      const colCalc = id % GRID_SIZE;
      REQUIRED_ROW_COUNT[rowCalc] += tile.quantity;
      REQUIRED_COL_COUNT[colCalc] += tile.quantity;
    }

    for (const [teamNumber, teamCompletions] of completionsMap) {
      updateTeamStates(
        teamStates[teamNumber - 1],
        teamCompletions,
        boardRequirements,
      );
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
    for (const [id, completionArr] of teamCompletions) {
      const requiredQty = boardReqs.get(id);
      if (requiredQty && completionArr.length >= requiredQty) {
        const tile = boardMap.get(id);
        if (tile) {
          const tilePoints = POINT_VALUES[tile.tier - 1];
          teamState.tilePoints += tilePoints;
          teamState.completedTiles.add(id);
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
    const teamState = teamStates[completedTile.team - 1];
    if (teamState.completedTiles.has(completedTile.tile_id)) {
      console.log(
        `addCompletionToTeamState: Tile completion was sent to teamstate but not needed`,
      );
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
    calcFinalTeamPoints(teamState, completedTile.team);
  } catch (error) {
    console.log(
      `addCompletionToTeamState: Error adding completion to team state: ${error}`,
    );
    throw error;
  }
};

const calcFinalTeamPoints = (teamState: Team, team: number): void => {
  let totalPoints = teamState.tilePoints;
  totalPoints += teamState.completedRows.size * ROW_POINTS;
  totalPoints += teamState.completedCols.size * COL_POINTS;
  teamPoints[team - 1] = totalPoints;
};

// --------------------- HIGHSCORES ------------------------
