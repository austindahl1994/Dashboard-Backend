import {
  addAllDiscordMembers,
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
    if (playersMap.size > 0) {
      console.log(`Clear players map was called`);
      playersMap.clear();
    }
    const sheetsPlayers = await getVingoPlayers();
    // console.log(`Got data from sheets: `);
    // console.log(sheetsPlayers);
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
export const updatePlayerBuyin = async (
  discord_id: string,
  discord_username: string,
  discord_nickname: string,
  rsn: string,
  donation: string,
) => {
  try {
    // check if playersManp has discord_id
    const player = playersMap.get(discord_id);
    if (player) {
      throw new Error(`Player with discord_id ${discord_id} already exists`);
    }
    let range: number = playersMap.size + 2; // +2 for header and 0 index
    const dataToUpdate: string[] = [
      discord_id,
      discord_username,
      discord_nickname,
      rsn,
      "0",
      "YES",
      donation,
    ];
    await updateVingoPlayer(range, dataToUpdate);
    playersMap.set(discord_id, {
      sheets_row: range,
      username: discord_username,
      nickname: discord_nickname,
      rsn: rsn,
      team: 0,
      paid: true,
      donation: Number(donation),
    });
    console.log(`List of players after change: `);
    console.log(playersMap);
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
  name?: string,
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

export const getNumberOfTeams = (): number => {
  try {
    //iterate through playersMap to get all team numbers, add them to a set to get unique values
    const teamSet: Set<number> = new Set();
    for (const [_id, player] of playersMap) {
      teamSet.add(player.team);
    }
    // console.log(`Found number of teams: ${teamSet.size}`);
    return teamSet.size;
  } catch (error) {
    console.log(`Error getting number of teams: ${error}`);
    throw error;
  }
};

export const updateUsers = async (users: any[]) => {
  try {
    const memberRows = users.map((member) => [
      member.id,
      member.user.username,
      member.nickname || member.user.username,
    ]);
    await addAllDiscordMembers(memberRows);
  } catch (error) {
    throw error;
  }
};
