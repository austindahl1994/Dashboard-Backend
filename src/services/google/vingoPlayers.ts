import { readSingleSheet, writeSingleSheet } from "./sheets.js";
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
