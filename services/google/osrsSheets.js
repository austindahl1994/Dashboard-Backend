import {
  createBountyObject,
  modifySheetData,
  createBounty,
} from "../../videogames/osrs/bounties/updateFromSheets.js";
import { difficultyToTier } from "../../videogames/osrs/bounties/bountyUtilities.js";
import * as sheets from "./sheets.js";
import {
  cachedBounties,
  numberOfBounties,
} from "../../videogames/osrs/cachedData.js";

import dotenv from "dotenv";
import { Bounty } from "../../videogames/osrs/bounties/Bounty.js";
dotenv.config();

export const getAllSheetBounties = async () => {
  const sheetsToRead = ["easy", "medium", "hard", "elite", "master"];
  const range = "A2:L50";
  const allRanges = sheetsToRead.map((sheet) => `${sheet}!${range}`);

  try {
    const allSheetData = await sheets.readMultipleSheets(allRanges);
    console.log("Batch data pulled successfully:");
    modifySheetData(allSheetData);
    return true;
  } catch (error) {
    console.error("Error reading from sheets:", error);
  }
};

export const getNewBounty = async (sheet, row) => {
  try {
    const range = `${sheet}!A${row}:L${row}`;
    const rowData = await sheets.readSingleSheet(range);
    console.log(`Successfully pulled bounty row data:`);
    console.log(rowData);
    const newBountyObj = createBountyObject(rowData[0]);
    createBounty(newBountyObj, sheet, row);
    console.log(`New bounty created:`);
    console.log(cachedBounties[difficultyToTier(sheet)]);
  } catch (error) {
    console.log(`Could not get bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

const tasksLeft = (id, sheet) => {
  return id - 1 < numberOfBounties[difficultyToTier(sheet)];
};

const updateBountyAndCheckNext = async (dataObj, sheet, row) => {
  let updates = [];
  updates.push(dataObj);
  const tasksRemaining = tasksLeft(row);
  if (tasksRemaining) {
    const range = `${sheet}!I${row + 1}`;
    const data = [["Active"]];
    updates.push({ range: range, values: data });
  }
  await sheets.writeBatchToSheet(updates);
  if (tasksRemaining) {
    console.log(`Bounty row ${row} updated successfully, moving to next task.`);
    await getNewBounty(sheet, row + 1);
  } else {
    console.log(
      `Bounty row ${row} updated successfully, no more tasks left in this tier.`
    );
    const emptyBounty = new Bounty({
      Tier_completed: true,
    });
    cachedBounties[difficultyToTier(sheet)] = emptyBounty;
  }
};

// Called when bounty completed, update current row with Status, RSN, Discord, S3_URL
export const completeBounty = async (sheet, row, data) => {
  try {
    const range = `${sheet}!I${row}:L${row}`;
    await updateBountyAndCheckNext(
      { range: range, values: [data] },
      sheet,
      row
    );
  } catch (error) {
    console.log(`Could not update bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

//Needs Status, RSN, Discord, S3_URL, Manually Verified
//Data is a 2D array [[]] where each index is a col, needs 6 values
export const markManuallyCompleted = async (
  sheet,
  row,
  discord,
  discordImgURL
) => {
  try {
    const finalArr = [
      ["MANUALLY COMPLETED", "", discord, discordImgURL, "YES"],
    ];
    const range = `${sheet}!I${row}:M${row}`;
    updateBountyAndCheckNext({ range: range, values: finalArr }, sheet, row);
  } catch (error) {
    console.log(`Could not update bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

// allSheetData.map((values, index) => {
//   console.log(`Data for sheet ${index + 1}:`);
//   console.log(values);
// });
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
