import { write } from "fs";
import { readSingleSheet, writeSingleSheet } from "./sheets.js";
import { allPlayers } from "@/vingo/cachedData.ts";
const END_COLUMN = "G";
const END_ROW_COUNT = 100;

// sheets GET request for vingo players
export const getVingoPlayers = async (): Promise<Array<Array<string>>> => {
  try {
    const data = await readSingleSheet(
      `players!A2:${END_COLUMN}${END_ROW_COUNT}`,
    );
    return data;
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

// sheets POST request to update vingo player
//discord_id, username, nickname, rsn, team, paid, donation
export const updateVingoPlayer = async (
  row: number,
  data: string[],
): Promise<void> => {
  try {
    await writeSingleSheet(`players!A${row}:${END_ROW_COUNT}${row}`, [data]);
    console.log(`Successfully updated player sheets with data: ${data}`);
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

export const addAllDiscordMembers = async (users: any[]): Promise<void> => {
  try {
    await writeSingleSheet(`allPlayers!A2`, users);
    console.log(`Successfully added members to sheets`);
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

export const getAllDiscordMembers = async (): Promise<void> => {
  try {
    const data = await readSingleSheet(`allPlayers!A2:C${400}`);
    for (const row of data) {
      const [discord_id, username, nickname] = row;
      allPlayers.set(username, { discord_id, username, nickname });
    }
    console.log(`Successfully cached all discord members`);
    // console.log(`All Players Map:`);
    // console.log(allPlayers);
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};
