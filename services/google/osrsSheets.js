import {
  createBountyObject,
  modifySheetData,
  createBounty,
} from "../../videogames/osrs/bounties/updateFromSheets.js";
import {
  difficultyToTier,
  tasksLeft,
} from "../../videogames/osrs/bounties/bountyUtilities.js";
import * as sheets from "./sheets.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";
import { updateBroadcast } from "../../bot/broadcasts.js";
import { Bounty } from "../../videogames/osrs/bounties/Bounty.js";

import dotenv from "dotenv";
dotenv.config();

export const getAllSheetData = async (data) => {
  try {
    const response = await sheets.readMultipleSheets(data);
    return response;
  } catch (e) {
    console.log("Error getting sheets data: ");
    console.log(e);
  }
};

// Called with "/refresh" command, reads all sheets, updates cached bounties
export const getAllSheetBounties = async () => {
  const sheetsToRead = ["easy", "medium", "hard", "elite", "master"];
  const range = "A2:L150"; //Start from A2 since the first row is header row, we just add this in later
  const allRanges = sheetsToRead.map((sheet) => `${sheet}!${range}`);

  try {
    const allSheetData = await sheets.readMultipleSheets(allRanges);
    // console.log("Batch data pulled successfully:");
    modifySheetData(allSheetData);
    return true;
  } catch (error) {
    console.error("Error reading from sheets:", error);
  }
};

// Get a new bounty from the sheet and row specified
// Sheet: difficulty, row: Sheet_Index
export const getNewBounty = async (sheet, row) => {
  try {
    const range = `${sheet}!A${row}:L${row}`;
    const rowData = await sheets.readSingleSheet(range);
    console.log(`Successfully pulled bounty row data:`);
    console.log(rowData);
    // const newBountyObj = createBountyObject(rowData[0]);
    // createBounty(newBountyObj, sheet, row);
    // console.log(`New bounty created:`);
    // console.log(cachedBounties[difficultyToTier(sheet)]);
    createNewBounty(sheet, rowData[0], row);
  } catch (error) {
    console.log(`Could not get bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

const createNewBounty = (difficulty, rowData, row) => {
  try {
    const newBountyObj = createBountyObject(rowData);
    createBounty(newBountyObj, difficulty, row);
    console.log(`New bounty created:`);
    console.log(cachedBounties[difficultyToTier(difficulty)]);
  } catch (error) {
    console.log(
      `Could not create new bounty for row: ${row}, sheet: ${difficulty}`
    );
  }
};

// After updating bounty row, check if there are more tasks in this tier, if so, activate next one
// dataObj is {range: "sheet!A1:B1", values: [[]]}
// Only works for one bounty?
const updateBountyAndCheckNext = async (dataObj, sheet, row) => {
  try {
    let updates = [];
    updates.push(dataObj); //Old task initially, with new task added to be set to active
    const tasksRemaining = tasksLeft(row, sheet);
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
      ["MANUALLY CLAIMED", "", discord, discordImgURL, "CLAIMED"],
    ];
    const range = `${sheet}!I${row}:M${row}`;
    await updateBountyAndCheckNext(
      { range: range, values: finalArr },
      sheet,
      row
    );
  } catch (error) {
    console.log(`Could not update bounty row: ${row}, sheet: ${sheet}`);
    console.error(error);
  }
};

// DataObj is {range: ["sheet!A1:B1"], values: [[]]}
export const skipBounty = async (
  dataToWrite,
  dataToRead,
  difficultiesAdded,
  rowIndex
) => {
  try {
    await sheets.writeBatchToSheet(dataToWrite);
    console.log(`Bounty skipped successfully.`);
    const allData = await sheets.readMultipleSheets(dataToRead);
    console.log("New bounty data: ");
    console.log(allData);
    allData.forEach((sheetData, index) => {
      createNewBounty(
        difficultiesAdded[index],
        sheetData[0],
        rowIndex[index] + 1
      );
    });
    // NEED TO ADD WHAT ROW IS BEING UPDATED
    // UPDATE BOUNTY BOARD AFTER TASK SKIPPED
    // MIGHT NEED TO ADD HIGHSCORE LOGIC FOR NONE
    await updateBroadcast("bounties");
  } catch (error) {
    throw error;
  }
};

//Take in final tasklist, add in every item, see how many times they appear, see how many tasks are for each tier
export const getFinalTasks = async (range) => {
  try {
    const data = await sheets.readMultipleSheets(range);
    return data;
  } catch (error) {
    console.log(`Error getting final tasks: `);
    console.log(error);
  }
};

//Take buy-ins/donations, get donation list, parse it, if user already paid or donated, add to donation amount, "/money" command
export const buyin = async (data) => {
  try {
    const { playerData, sheetRange } = data;
    // console.log(`Saving buyin to sheets: ${sheetRange} with data:`);
    // console.log(playerData);
    await sheets.writeSingleSheet(sheetRange, [playerData]);
  } catch (error) {
    console.log(error);
    throw new Error(`Error saving buyin to sheets: ${error}`);
  }
};

export const getAllMembers = async () => {
  try {
    const allMembers = await sheets.readSingleSheet("members!A2:H500");
    // console.log(`All members:`);
    // console.log(allMembers);
    return allMembers;
  } catch (error) {
    console.log(`Error getting all members: `);
    console.log(error);
  }
};

// Takes in a range of data to get, Ex. ["member!B2:B400", "member!F2:F400"]
export const getSpecificMemberData = async (ranges) => {
  try {
    const data = await sheets.readMultipleSheets(ranges);
    return data;
  } catch (error) {
    throw error;
  }
};

//Add all discord members to google sheet from discord
export const addMembers = async (memberData) => {
  try {
    console.table(memberData);
    await sheets.writeBatchToSheet(memberData);
    console.log(`Successfully added members to sheet`);
  } catch (error) {
    console.log(`Error adding members to sheet: `);
    console.log(error);
  }
};

const writeSheetsGroups = async (data) => {
  try {
    await sheets.writeBatchToSheet(data);
  } catch (error) {
    console.log(`Error writing groups to sheets: ${error}`);
    throw error;
  }
};

//Move all final tasklist into the other sheets based on difficulty
export const migrateTasks = async (data) => {
  try {
    await sheets.writeBatchToSheet(data);
  } catch (error) {
    console.log(`Error writing groups to sheets: ${error}`);
    throw error;
  }
};
