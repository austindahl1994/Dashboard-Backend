import { Completion } from "@/types/completion.js";
import { completionsMap } from "./cachedData.js";
import { getAllCompletionData } from "./mvc/vingo.js";
// Completions map = ([team number, team Map()])
// team map = ([tile id, array of RSNs []])

// Assumptions for completions SQL table:
// id: number auto_increments, team: number, tile_id: number, rsn: string, url: string, item: array, obained_at: string

const pointValues: number[] = [1, 2, 3, 5, 8];

const BOARD_ARRAY: Array<[number, Array<string>]> = Array.from(
  { length: 100 },
  (_, index) => [index + 1, []]
);

// Need to await board creation and cache first
export const cacheCompletions = async (): Promise<void> => {
  try {
    const completionsData: Array<Completion> = await getAllCompletionData(); // NEED TO IMPLEMENT AS A MODEL
    // Teams data returned will be array of objects
    // [{id, team, tile_id, rsn, url, item, obtained_at}]
    createCachedCompletions(completionsData);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const createCachedCompletions = (completionsData: Array<Completion>): void => {
  try {
    completionsMap.clear();
    completionsData.forEach((completion: Completion) => {
      // Get/create team map to show completions for tiles
      let teamMap = completionsMap.get(completion.team);
      if (!teamMap) {
        teamMap = new Map<number, Array<string>>(BOARD_ARRAY);
        completionsMap.set(completion.team, teamMap);
      }
      let tileArr = teamMap.get(completion.tile_id);
      if (!tileArr) {
        tileArr = [];
        teamMap.set(completion.tile_id, tileArr);
      }
      tileArr.push(completion.rsn);
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const updatePlayerCompletion = (
  team: number,
  tile_id: number,
  rsn: string
): void => {
  try {
    const teamMap = completionsMap.get(team);
    if (!teamMap) {
      throw new Error(
        `There is no created completion team map for team: ${team}!`
      );
    }
    const tileArr: string[] | undefined = teamMap.get(tile_id);
    if (!tileArr) {
      throw new Error(`There is no created tile_id for team: ${team}!`);
    }
    tileArr.push(rsn);
  } catch (e) {
    console.log(e);
    throw e;
  }
};
