import { cachedBounties, numberOfBounties } from "../cachedData.js";
import { Bounty } from "./Bounty.js";
import { createCachedHighscores } from "../highscores/highscores.js";
import {
  difficultyToTier,
  getTier,
  getURLImage,
  bountyHeaders as headers,
} from "./bountyUtilities.js";
import { writeBatchToSheet } from "../../../services/google/sheets.js";

// receives all sheet data as an array of arrays, each array is a sheet
// each sheet has first row as headers, rest as data
// converts each sheet to an array of objects, stores in cachedSheets
// then calls checkBounties to update cachedBounties if needed
const modifySheetData = (allSheetData) => {
  try {
    const finalSheetData = allSheetData.map((sheet) => {
      const sheetsArr = [];
      sheet.forEach((row) => {
        const bountyObject = createBountyObject(row);
        sheetsArr.push(bountyObject);
      });
      return sheetsArr;
    });
    sheetsToBounties(finalSheetData);
  } catch (error) {
    console.log(error);
  }
};

const sheetsToBounties = async (sheetsArr) => {
  try {
    const newWrites = [];
    //We add +2 for indexes since sheets start at index 1 AND skipping header row
    sheetsArr.forEach((sheet, tier) => {
      numberOfBounties[tier] = sheet.length;
      const difficulty = getTier(tier);
      const activeIndex = sheet.findIndex((obj) => obj.Status === "Active");
      // Checks for the current Status of "Active" in the sheet, if found updates cachedBounties with that object
      // If not found, finds the first "Open" status, updates that to "Active by updating cachedBounties with that object, and adds a write to newWrites to update the sheet
      if (activeIndex !== -1) {
        createBounty(sheet[activeIndex], difficulty, activeIndex + 2);
      } else {
        const openIndex = sheet.findIndex((obj) => obj.Status === "Open");
        if (openIndex !== -1) {
          // console.log(`Open index: ${openIndex + 2} for tier ${difficulty}`);
          sheet[openIndex].Status = "Active";
          // Adds write object to newWrites array for it to be written in batch later
          // console.log(`Adding writeObj for tier ${difficulty}`);
          const writeObj = {
            range: `${difficulty}!I${openIndex + 2}`,
            values: [["Active"]],
          };
          newWrites.push(writeObj);
          createBounty(sheet[openIndex], difficulty, openIndex + 2);
        } else {
          // console.log(`No open index for: ${difficulty}`);
          const newBounty = new Bounty();
          newBounty.Tier_completed = true;
          cachedBounties[getTier(difficulty)] = newBounty;
        }
      }
    });

    updateSheetActives(newWrites);

    // console.log(`Final cached bounties:`);
    // console.log(cachedBounties);
    // console.log(`Number of bounties per tier:`);
    // console.table(numberOfBounties);
    // console.log(`Number of bounties per tier:`);
    // numberOfBounties.forEach((count, index) => {
    //   console.log(`Tier ${getTier(index)}: ${count}`);
    // });
    createCachedHighscores(sheetsArr);
  } catch (error) {
    console.log(error);
  }
};

//Passed in single array of rows to be made into an object
const createBountyObject = (bountyRow) => {
  try {
    if (bountyRow.length !== headers.length) {
      bountyRow.push(...Array(headers.length - bountyRow.length).fill(""));
    }
    const rowObj = {};
    headers.forEach((header, colIndex) => {
      rowObj[header] = bountyRow[colIndex];
    });
    return rowObj;
  } catch (error) {
    console.log(error);
  }
};

const createBounty = (bountyData, difficulty, sheetIndex) => {
  try {
    // console.log(`Create bounty called for difficulty ${difficulty}`);
    const tier = difficultyToTier(difficulty);
    // console.log(`Creating bounty for tier: ${tier}, sheetIndex: ${sheetIndex}`);
    // Ensure Item is always an array of strings
    let items = [];
    if (Array.isArray(bountyData.Item)) {
      items = bountyData.Item.map((i) => i.trim()).filter((i) => i.length > 0);
    } else if (
      typeof bountyData.Item === "string" &&
      bountyData.Item.trim() !== ""
    ) {
      // Split by comma if multiple items in a string
      items = bountyData.Item.split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
    }

    const newBounty = new Bounty({
      ...bountyData,
      Type: bountyData?.Type?.trim() || "loot",
      Id: sheetIndex - 1, //Since index starts at 1 for sheets, not 0
      Difficulty: `${difficulty}`,
      Item: items,
      Bounty: bountyData.Bounty,
      Sheet_Index: sheetIndex,
      Wiki_Image:
        bountyData.Type.trim().toLowerCase() === "death"
          ? bountyData.Wiki_URL
          : getURLImage(bountyData.Wiki_URL),
    });

    cachedBounties[tier] = newBounty;
  } catch (error) {
    console.log(error);
  }
};

const updateSheetActives = async (newWrites) => {
  if (newWrites.length > 0) {
    console.log(`Need to write the new actives to the sheet`);
    try {
      await writeBatchToSheet(newWrites);
    } catch (error) {
      console.error(`Error batching to sheet: ${error}`);
    }
  }
};

export { createBountyObject, createBounty, modifySheetData };

// if (bountyData.Type.toLowerCase() === "death") {
//   console.log(`Death type, should not use modified image url`);
// }
