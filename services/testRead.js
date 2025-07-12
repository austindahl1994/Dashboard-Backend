import dotenv from "dotenv";
dotenv.config();

import { readFromMultipleSheets } from "./sheetService.js";
import { checkSheets } from "../videogames/osrs/bountyUtilities.js";

export const testRead = async () => {
  const sheetsToRead = ["tier1", "tier2", "tier3"];
  const range = "A1:L50"; //can be more specific when knowing exact range
  const allRanges = sheetsToRead.map((sheet) => `${sheet}!${range}`);

  try {
    // Return as array of arrays [[sheet1Arrays], [sheet2Arrays], [sheet3Arrays]]
    const allSheetData = await readFromMultipleSheets(allRanges);

    console.log("Batch data pulled successfully:");

    // allSheetData.forEach(({ range, values }, index) => {
    //   console.log(`Data from range: ${range}`);
    //   console.table(values);
    //   console.log(values);
    // });

    // allSheetData.map((values, index) => {
    //   console.log(`Data for sheet ${index + 1}:`);
    //   console.log(values);
    // });

    checkSheets(allSheetData);
    return true;
  } catch (error) {
    console.error("Error reading from sheets:", error);
  }
};

// import { readFromSheet } from "./sheetService.js";

// const testRead = async () => {
//   const allSheets = [];
//   try {
//     const sheetsToRead = ["t1", "t2", "t3"];
//     const range = "A1:I50"; //Expected range
//     const data = await readFromSheet(range);

//     for (const sheetName of sheetsToRead) {
//       const fullRange = `${sheetName}!${range}`;
//       const data = await readFromSheet(fullRange);
//       console.log(`Successfully got data for sheet: "${sheetName}":`);
//       // console.table(data);
//       allSheets.push(data);
//     }
//     console.log(`Final data that is passed in:`);
//     allSheets.forEach((sheet) => {
//       console.table(sheet);
//     });
//   } catch (error) {
//     console.error("Error reading from sheet:", error);
//   }
// };
