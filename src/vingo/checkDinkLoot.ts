import { Tile } from "@/types/tile.ts";
import { boardMap, completionsMap, playersMap } from "./cachedData.ts";

import { Dink } from "@/types/dink.ts";
import { getPlayerInfo } from "./players.ts";
import { Player } from "@/types/player.ts";
import { Completion, SimpleCompletion } from "@/types/completion.ts";

interface MatchedItem {
  item: string;
  tile: Tile;
  tileId: number;
}

// Take in dink items, check each item/source against all items listed for the board, if any match, add them to a board array
// If boardArray isn't empty, first check if player rsn is cached, get the team for that player rsn, check cached completions for that team, seeing if the number of completions at that tile_id key
export const checkDinkLoot = (data: Dink): Completion[] | false => {
  try {
    const boardArr: MatchedItem[] = checkBoard(
      data?.extra?.items?.map((item) => item.name) || [],
      data?.extra?.source || "",
    );
    if (boardArr.length === 0) {
      console.log(`checkDinkLoot: No items match board`);
      return [];
    }
    const completions: Completion[] = [];
    boardArr.forEach((e) => {
      const verified: Completion | false = checkCompletions(
        e.tile,
        data.playerName,
        e.item,
        e.tileId,
      );
      if (verified) {
        completions.push(verified);
      }
    });
    return completions;
  } catch (error) {
    console.error(`There was an error: ${error}`);
    return [];
  }
};

const checkBoard = (items: string[], source: string): MatchedItem[] => {
  try {
    const tilesIterator = boardMap.entries();
    const matchedItems: MatchedItem[] = [];
    for (const [tileId, tile] of tilesIterator) {
      for (const item of items) {
        if (
          tile.items.includes(item) &&
          (tile.source === source || tile.source.trim() === "")
        ) {
          matchedItems.push({ item, tile, tileId });
        }
      }
    }
    // If true, use tile_id with team to check and see if that team needs the item for completion
    const matchedItemsArr = matchedItems.map((mi) => mi.item).join(", ");
    console.log(`checkBoard: items matching board: ${matchedItemsArr}`);
    return matchedItems;
  } catch (error) {
    console.error(`There was an error: ${error}`);
    return [];
  }
};

// passed in RSN and a tile, get the team that the RSN matches, check completion map for that team, see if the number of completions (number of elements in completions array for that tile) is less than the quantity required for that tile

// Have a new completion function that is used by: server automatically from dink data, manual discord completion, manual input from player from web page
const checkCompletions = (
  tile: Tile,
  rsn: string,
  item: string,
  tileId: number,
): Completion | false => {
  try {
    const player: Player | undefined = getPlayerInfo(rsn);
    if (!player) {
      console.log(`checkCompletions: No matching player for RSN: ${rsn}`);
      return false;
    }
    const team = player.team;
    let teamMap = completionsMap.get(team);

    // Check if there is a outer team map that exists
    if (!teamMap || teamMap === undefined) {
      console.log(
        `checkCompletions: No matching team for player: ${player.rsn} against team: ${team}`,
      );
      console.log(`Creating team: ${team} in completionsMap...`);
      teamMap = new Map<number, SimpleCompletion[]>();
      completionsMap.set(team, teamMap);
    }
    let completionsForTile = teamMap.get(tileId);

    // check if there is an inner tile array that exists
    if (!completionsForTile) {
      console.log(
        `checkCompletions: No completions found for tile ID: ${tileId} in team: ${team}`,
      );
      console.log(
        `Creating tile for id: ${tileId} inside the team ${team} completionsMap...`,
      );
      completionsForTile = [];
      teamMap.set(tileId, completionsForTile);
    }
    console.log(
      `checkCompletions: existing tile completions for team ${team}: ${completionsForTile.length} against necessary completions for tile: ${tile.quantity}`,
    );
    if (completionsForTile.length < tile.quantity) {
      const safePlayerName = encodeURIComponent(rsn);
      const imageURL = `completions/team${team}/${tileId}/${safePlayerName}`;
      return {
        team,
        tile_id: tileId,
        rsn,
        url: imageURL,
        item,
        obtained_at: new Date().toISOString(),
      };
    }
    return false;
  } catch (error) {
    console.error(`checkCompletions:There was an error: ${error}`);
    return false;
  }
};
