// THIS IS WHERE WE WILL STORE CACHED GRID DATA FOR BATTLESHIP

import { BattleshipCell } from "@/types/battleship.ts";

// Need to cache grid obtained from google sheets

// Need to cache ship placements from DB/Sheets

// Cache player data, load data once from database on load, then update as needed, instead of querying DB every time for player data, just update on change and store in memory

export const getAllBattleShipData = async () => {
  try {
    // Get board from google sheets
    // Get player battleship data
    // Get ship data
  } catch (error) {
    throw error;
  }
};
// CREATE TABLE ships (id tinyint AUTO_INCREMENT PRIMARY KEY, cell varchar(5), item varchar(255));
export const getCachedBoard = async () => {
  try {
  } catch (error) {
    throw error;
  }
};

getAllBattleShipData();
