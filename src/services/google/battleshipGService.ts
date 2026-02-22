// ALL GOOGLE DOCS CALLS
import { readSingleSheet } from "./sheets.js";

// sheets request for battleship board
export const getBattleshipBoard = async (): Promise<Array<Array<string>>> => {
  try {
    const data = await readSingleSheet("Board!A2:D101");
    // console.log(`Data from sheets:`);
    // console.log(data);
    return data;
  } catch (error) {
    console.error(
      `There was an error getting battleship board from sheets: ${error}`,
    );
    throw error;
  }
};
