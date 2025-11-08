import { readSingleSheet, writeSingleSheet } from "./sheets";
const END_COLUMN = "G";
const END_ROW_COUNT = 5;

// sheets GET request for vingo players
export const getVingoPlayers = async (): Promise<Array<Array<string>>> => {
  try {
    const data = await readSingleSheet(
      `players!A2:${END_COLUMN}${END_ROW_COUNT}`
    );
    return data;
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};

// sheets POST request to update vingo players
export const updateVingoPlayers = async (range: number): Promise<void> => {
  try {
    await writeSingleSheet(`players!${range}`);
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};
