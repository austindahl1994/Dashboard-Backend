import { readSingleSheet } from "./sheets.js";

export const getTowerFloors = async (): Promise<number[]> => {
  try {
    const data = await readSingleSheet("Floors!A2:A101");
    return data.map((row) => parseInt(row[0], 10));
  } catch (error) {
    console.error(
      `There was an error getting tower floors from sheets: ${error}`,
    );
    throw error;
  }
};
