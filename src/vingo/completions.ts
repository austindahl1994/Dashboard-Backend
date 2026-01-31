import { Completion, SimpleCompletion } from "@/types/completion.js";
import { completionsMap } from "./cachedData.ts";
import { addCompletion, getAllCompletions } from "./mvc/vingo.ts";
import { addCompletionToTeamState } from "./points.ts";
// Completions map = ([team number, team Map()])
// team map = <tile_id, array of Completions[]>

// Assumptions for completions SQL table:
// id: number auto_increments, team: number, tile_id: number, rsn: string, url: string, item: array, obained_at: string

// Run on refresh and server start
export const cacheCompletions = async (): Promise<void> => {
  try {
    const completionsData: Completion[] = await getAllCompletions();
    createCachedCompletions(completionsData);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// This works, but for the front end it might be good to have tile_id added to simpleCompletion interface so it can be referenced easily?
// Instead, when returning it to frontend, pass back an array of objects for that team of { tile_id: number, simpleCompletions[]} ?
// Ex [{tile_id: 1, completions: [completion1, completion2]}, ...]
const createCachedCompletions = (completionsData: Completion[]): void => {
  try {
    completionsMap.clear();
    completionsData.forEach((completion: Completion) => {
      const { team, tile_id, rsn, url, item, obtained_at } = completion;
      if (completionsMap.has(team)) {
        const teamMap = completionsMap.get(team);
        if (teamMap) {
          if (teamMap.has(tile_id)) {
            teamMap
              .get(tile_id)
              ?.push({ rsn, url: url ?? undefined, item, obtained_at });
          } else {
            teamMap.set(tile_id, [
              { rsn, url: url ?? undefined, item, obtained_at },
            ]);
          }
        }
      } else {
        const teamMap = new Map<number, SimpleCompletion[]>();
        teamMap.set(tile_id, [
          { rsn, url: url ?? undefined, item, obtained_at },
        ]);
        completionsMap.set(team, teamMap);
      }
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const updateCompletions = async (data: Completion): Promise<void> => {
  try {
    const { team, tile_id, rsn, url, item, obtained_at } = data;
    const teamMap = completionsMap.get(team);
    if (!teamMap) {
      throw new Error(`There is no team: ${team} cached!`);
    }

    // If the team exists but the tile_id is missing, create it and push the data
    if (!teamMap.has(tile_id)) {
      teamMap.set(tile_id, [{ rsn, url: url ?? undefined, item, obtained_at }]);
    } else {
      teamMap
        .get(tile_id)
        ?.push({ rsn, url: url ?? undefined, item, obtained_at });
    }
    console.log(`Successfully added completion to cachedCompletions: `);
    console.log({ rsn, url, item, obtained_at });
    addCompletionToTeamState(data);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// export const getTeamCompletions = (
//   team: number
// ): { tile_id: number; completions: SimpleCompletion[] }[] => {
//   const teamMap = completionsMap.get(team);
//   if (!teamMap) {
//     return [];
//   }
//   const result: { tile_id: number; completions: SimpleCompletion[] }[] = [];
//   teamMap.forEach((completions, tile_id) => {
//     result.push({ tile_id, completions });
//   });
//   return result;
// };
