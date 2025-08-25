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
  const range = "A2:L50"; //Start from A2 since the first row is header row, we just add this in later
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
  try {
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
      console.log(
        `Bounty row ${row} updated successfully, moving to next task.`
      );
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
  } catch (error) {
    console.log(error);
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
    console.log(error);
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

//Take in final tasklist, add in every item, see how many times they appear, see how many tasks are for each tier
export const getFinalTasks = async () => {
  try {
    const range = ["final!B2:B400", "final!F2:F400"]; //Only need items and difficulty currently
    const data = await sheets.readMultipleSheets(range);
    return data;
  } catch (error) {
    console.log(`Error getting final tasks: `);
    console.log(error);
  }
};

//Move all final tasklist into the other sheets based on difficulty
export const migrateTasks = async () => {};

//Take buy-ins/donations, get donation list, parse it, if user already paid or donated, add to donation amount, "/money" command
export const buyin = async (data) => {
  try {
    const { sheetData, sheetRange } = data;
    // console.log(`Saving buyin to sheets: ${sheetRange} with data:`);
    // console.log(sheetData);
    await sheets.writeSingleSheet(sheetRange, [sheetData]);
  } catch (error) {
    throw new Error(`Error saving buyin to sheets: ${error}`);
  }
};

export const getAllMembers = async () => {
  try {
    const allMembers = await sheets.readSingleSheet("members!A2:D500");
    // console.log(`All members:`);
    // console.log(allMembers);
    return allMembers;
  } catch (error) {
    console.log(`Error getting all members: `);
    console.log(error);
  }
};

//Add all discord members to google sheet from discord
export const addMembers = async (memberData) => {
  try {
    await sheets.writeSingleSheet(
      `members!A2:D${memberData.length + 1}`,
      memberData
    );
    console.log(`Successfully added members to sheet`);
  } catch (error) {
    console.log(`Error adding members to sheet: `);
    console.log(error);
  }
};

//Compares users who wanted to join but haven't paid
export const missing = async () => {};

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
