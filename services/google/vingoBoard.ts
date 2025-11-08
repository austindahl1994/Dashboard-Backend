import { readSingleSheet } from "./sheets";

// sheets request for vingo board
export const getVingoBoard = async (): Promise<Array<Array<string>>> => {
  try {
    const data = await readSingleSheet("tiles!A2:I101");
    return data;
  } catch (error) {
    console.error(`There was an error: ${error}`);
    throw error;
  }
};
