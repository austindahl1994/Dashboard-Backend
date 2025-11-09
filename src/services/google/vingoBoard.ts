import { readSingleSheet } from "./sheets.js";

// sheets request for vingo board
export const getVingoBoard = async (): Promise<Array<Array<string>>> => {
  try {
    const data = await readSingleSheet("tiles!A2:I101");
    return data;
  } catch (error) {
    console.error(
      `There was an error getting vingo board from sheets: ${error}`
    );
    throw error;
  }
};
