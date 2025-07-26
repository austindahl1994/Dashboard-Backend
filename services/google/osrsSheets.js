import dotenv from "dotenv";
dotenv.config();

import { readFromMultipleSheets } from "./sheets.js";
import { checkSheets } from "../../videogames/osrs/bounties/bountyUtilities.js";
//TODO: Leaving off on updating one row, along with the next row to be set as active
// Get all sheets 
export const getAllSheetBounties = async () => {
  const sheetsToRead = ["easy", "medium", "hard", "elite", "master"];
  const range = "A1:M50";
  const allRanges = sheetsToRead.map((sheet) => `${sheet}!${range}`);

  try {
    const allSheetData = await readFromMultipleSheets(allRanges);

    console.log("Batch data pulled successfully:");

    checkSheets(allSheetData);
  } catch (error) {
    console.error("Error reading from sheets:", error);
  }
};

// Called when bounty completed, update current row, along with next row single cell for status
export const updateBountyRow = async (row, sheet, data) => {
  try {
    let dataArr = []
    const range = `${sheet}!H${row}:M${row}`
    
  } catch (error) {
    
  }
}

export const getBountyRow = async (row, sheet) => {
  try {
    const range = `${sheet}!A${row}:M${row}`
    const rowData = await readSingleSheet()
    console.log(`Successfully pulled bounty row data`)
    return rowData
  } catch (error) {
    
  }
}

// All Read comments
// Return as array of arrays [[sheet1Arrays], [sheet2Arrays], ...]
    // allSheetData.forEach(({ range, values }, index) => {
    //   console.log(`Data from range: ${range}`);
    //   console.table(values);
    //   console.log(values);
    // });

    // allSheetData.map((values, index) => {
    //   console.log(`Data for sheet ${index + 1}:`);
    //   console.log(values);
    // });
