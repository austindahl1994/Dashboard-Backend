import { Tile } from "@/types/tile.ts";
import { boardMap } from "./cachedData.ts";
import { Dink, Item } from "@/types/dink.ts";
import { getPlayerInfo } from "./playerFunctions.ts";
import { Player } from "@/types/player.ts";
import { Completion } from "@/types/completion.ts";

interface CompletedTile {
  tile_id: number;
  item: string;
}

export const checkTile = (data: any): Completion[] | null => {
  try {
    const { type, playerName, extra, discordUser } = data;
    const dink: Dink = {
      type,
      playerName,
      items: extra?.items ?? [],
      source: extra?.source ?? "",
      discordUser,
    };

    if (dink.items.length === 0 || dink?.type?.toLocaleLowerCase() !== "loot") {
      throw new Error(`Type mismatch: ${dink.type} OR no items passed in`);
    }
    const completedTiles: Completion[] = [];
    dink.items.forEach((item: Item) => {
      for (const [id, tile] of boardMap) {
        const matchingTiles = compareTile(tile, item, dink.source);
        if (matchingTiles.length === 0) return [];
      }
    });
    // Move this to controller
    // const matchingPlayer: Player | undefined = getPlayerInfo(
    //   dink.playerName,
    //   discordUser.id,
    //   discordUser.name
    // );
    if (completedTiles.length) {
      // What to return here, array of completed items to be added?
      // After this step, if returnedData.length > 0, upload/create AWS URL string
      // For each array object, insert into completions table
      // Broadcast to that team the completions
    }
    return null;
  } catch (error) {
    throw error;
  }
};

const compareTile = (
  tile: Tile,
  item: Item,
  source: string
): CompletedTile[] => {
  try {
    //match source
    if (
      tile.source.toLocaleLowerCase() !== source.toLocaleLowerCase() &&
      tile.source !== ""
    ) {
      return [];
    }
    const matchingItems: CompletedTile[] = [];
    if (
      tile.items.includes(item.name) &&
      source.toLocaleLowerCase() === tile.source.toLocaleLowerCase()
    ) {
      const completedTile: CompletedTile = {
        tile_id: tile.id,
        item: item.name,
      };
      matchingItems.push(completedTile);
    }
    return matchingItems;
  } catch (error) {
    throw error;
  }
};
