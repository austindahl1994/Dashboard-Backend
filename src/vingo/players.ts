import {
  getVingoPlayers,
  updateVingoPlayer,
} from "@/services/google/vingoPlayers.js";
import { playersMap } from "./cachedData.ts";
import { Player } from "@/types/player.js";

// Gets player data from sheets
// [
//   [discord_id, discord, nickname, rsn, team, paid, donation]
// ]

const headers: string[] = [
  "discord_id",
  "discord",
  "nickname",
  "rsn",
  "team",
  "paid",
  "donation",
];
const END_COLUMN = "G";
// caches player data
export const cachePlayers = async (): Promise<void> => {
  try {
    const sheetsPlayers = await getVingoPlayers();
    console.log(`Got data from sheets: `);
    console.log(sheetsPlayers);
    formatPlayers(sheetsPlayers); //formats and caches player data
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const formatPlayers = (sheetsPlayers: Array<string[]>) => {
  try {
    sheetsPlayers.forEach((playerRow: string[], rowIndex) => {
      const playerDiscord: string = playerRow[0];
      const newPlayer: Player = {
        sheets_row: rowIndex + 2,
        username: playerRow[1],
        nickname: playerRow[2],
        rsn: playerRow[3],
        team: Number(playerRow[4]),
        paid: playerRow[5] ? true : false,
        donation: playerRow[6] ? Number(playerRow[6]) : 0,
      };

      playersMap.set(playerDiscord, newPlayer);
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

// [discord, nickname, discord_id, rsn, team, paid, donation]
// Update single player for buy in to google sheets
export const updatePlayer = async (
  discord_id: string,
  discord_username: string,
  discord_nickname: string,
  rsn: string,
  donation: string
) => {
  try {
    let range: number;
    // Check if player is already on sheets to update some value
    if (playersMap.has(discord_id)) {
      const player = playersMap.get(discord_id);
      if (!player)
        throw new Error(
          `Could not find player data, even though discord id is cached`
        );
      range = player.sheets_row;
      // player is not on sheets, add them in
    } else {
      range = playersMap.size + 2;
    }

    const dataToUpdate: string[] = [
      discord_username,
      discord_nickname,
      discord_id,
      rsn,
      "0",
      "YES",
      donation,
    ];
    await updateVingoPlayer(range, dataToUpdate);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getAllRSNs = (): string[] => {
  try {
    const allRSNs: string[] = [];
    for (const [_, player] of playersMap) {
      allRSNs.push(player.rsn);
    }
    return allRSNs;
  } catch (error) {
    throw error;
  }
};

export const getPlayerInfo = (
  rsn: string,
  id?: string,
  name?: string
): Player | undefined => {
  try {
    if (id) {
      const byId = playersMap.get(id);
      if (byId) return byId;
    }

    const rsnLower = rsn.toLowerCase();
    const nameLower = name?.toLowerCase();

    for (const [_id, player] of playersMap) {
      if (player.rsn.toLowerCase() === rsnLower) return player;
      if (nameLower && player.username.toLowerCase() === nameLower)
        return player;
    }

    return undefined;
  } catch (error) {
    throw error;
  }
};
