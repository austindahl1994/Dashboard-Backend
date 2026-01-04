import { Team } from "@/types/teams.ts";
import { teamStates, completionsMap } from "./cachedData.ts";

export const createTeamStates = () => {
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
};
