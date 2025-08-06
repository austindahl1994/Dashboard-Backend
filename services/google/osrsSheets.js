import dotenv from "dotenv";
dotenv.config();

import * as sheets from "./sheets.js";

export const getAllSheetBounties = async () => {
  const sheetsToRead = ["easy", "medium", "hard", "elite", "master"];
  const range = "A2:M50";
  const allRanges = sheetsToRead.map((sheet) => `${sheet}!${range}`);

  try {
    const allSheetData = await sheets.readFromMultipleSheets(allRanges);
    console.log("Batch data pulled successfully:");
    modifySheetData(allSheetData);
  } catch (error) {
    console.error("Error reading from sheets:", error);
  }
};

// Called when bounty completed, update current row with Status, RSN, Discord, S3_URL, Quantity
export const completeBounty = async (sheet, row, data) => {
  try {
    const range = `${sheet}!I${row}:M${row}`;
    await writeSingleSheet(range, data);
  } catch (error) {
    console.log(`Could not update bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

export const getNewBounty = async (sheet, row) => {
  try {
    const range = `${sheet}!A${row}:M${row}`;
    const rowData = await readSingleSheet(range);
    console.log(`Successfully pulled bounty row data:`);
    console.log(rowData);
    const newBountyObj = createBountyObject(rowData);
    createBounty(newBounty, sheet, row);
  } catch (error) {
    console.log(`Could not get bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

//Needs Status, RSN, Discord, S3_URL, Quantity, Manually Verified
//Data is a 2D array [[]] where each index is a col, needs 6 values
export const markManuallyCompleted = async (
  discordUsername,
  discordImgURL,
  sheet,
  row
) => {
  try {
    const finalArr = [
      [
        "MANUALLY COMPLETED",
        "",
        discordUsername,
        discordImgURL,
        "69420",
        "YES",
      ],
    ];
    const range = `${sheet}!I${row}:N${row}`;
    await writeSingleSheet(range, finalArr);
  } catch (error) {
    console.log(`Could not update bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

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
