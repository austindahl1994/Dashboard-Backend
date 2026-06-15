// THIS IS WHERE WE WILL STORE CACHED GRID DATA FOR BATTLESHIP

import { getBothBoards } from "@/services/google/battleshipGService.ts";
import { BattleshipCell } from "@/types/index.ts";

// Need to cache grid obtained from google sheets

// Need to cache ship placements from DB/Sheets

// Cache player data, load data once from database on load, then update as needed, instead of querying DB every time for player data, just update on change and store in memory
const headers: string[] = ["id", "item", "url"];

export const getAllBattleShipData = async () => {
  try {
    const data = await getBothBoards();
    const fullBoards = data.map((sheet, sheetIndex) => {
      return sheet.map((row, rowIndex) => {
        // Logic here
      });
    });
  } catch (error) {
    throw error;
  }
};

const boardOne = new Map();

getAllBattleShipData();
