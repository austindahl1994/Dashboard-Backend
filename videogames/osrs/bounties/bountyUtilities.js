import { writeBatchToSheet } from "../../../services/sheetService.js";
import { Bounty } from "./Bounty.js";
import { cachedBounties, cachedSheets } from "../cachedData.js";
import { updateHighscores } from "../highscores/highscoresUtilities.js";
import { updateAllSimpleData } from "./bountyUpdates.js";

const MAX_TIERS = 5;

// receives all sheet data as an array of arrays, each array is a sheet
// each sheet has first row as headers, rest as data
// converts each sheet to an array of objects, stores in cachedSheets
// then calls checkBounties to update cachedBounties if needed
const checkSheets = async (allSheetData) => {
  allSheetData.forEach((sheet, sheetIndex) => {
    const [headers, ...rows] = sheet;
    const sheetObjects = [];

    rows.forEach((row) => {
      if (row.length !== headers.length) {
        row.push(...Array(headers.length - row.length).fill(""));
      }

      const rowObj = {};
      headers.forEach((header, colIndex) => {
        rowObj[header] = row[colIndex];
      });

      sheetObjects.push(rowObj);
    });

    cachedSheets[sheetIndex] = sheetObjects;
  });

  console.log(`Finished caching sheets, data:`);
  console.log(cachedSheets);
  await setNewActiveBounty();
};

//separate cachedSheets and new sheets functionality? Still have it iterative over their array of objects
const setNewActiveBounty = async () => {
  const newWrites = [];

  cachedSheets.forEach((sheet, tier) => {
    const activeIndex = sheet.findIndex((obj) => obj.Status === "Active");
    // Checks for the current Status of "Active" in the sheet, if found updates cachedBounties with that object
    // If not found, finds the first "Open" status, updates that to "Active by updating cachedBounties with that object, and adds a write to newWrites to update the sheet
    if (activeIndex !== -1) {
      updateBounty(sheet[activeIndex], tier, activeIndex + 1);
    } else {
      const openIndex = sheet.findIndex((obj) => obj.Status === "Open");
      if (openIndex !== -1) {
        console.log(
          `Found an open index at index ${openIndex + 2} for tier ${getTier(
            tier
          )}`
        );
        sheet[openIndex].Status = "Active";
        // Adds write object to newWrites array for it to be written in batch later
        console.log(`Adding writeObj for tier ${getTier(tier)}`);
        const writeObj = {
          range: `${getTier(tier)}!H${openIndex + 2}`,
          values: [["Active"]],
        };
        newWrites.push(writeObj);
        updateBounty(sheet[openIndex], tier, openIndex + 2);
      } else {
        console.log(
          `Could not find an open index at ${getTier(
            tier
          )}. All might be complete, need to add functionality`
        );
        const newBounty = new Bounty();
        newBounty.Tier_completed = true;
        newBounty.Item = [""];
        cachedBounties[tier] = newBounty;
      }
    }
  });

  if (newWrites.length > 0) {
    console.log(`Need to write the new actives to the sheet`);
    await writeBatchToSheet(newWrites);
  }

  console.log(`Final cached bounties:`);
  console.log(cachedBounties);

  updateHighscores();
  updateAllSimpleData();
};

//
const updateBounty = (newObj, tier, openIndex) => {
  console.log(`Update bounty called for difficulty ${getTier(tier)}`);
  // Ensure Item is always an array of strings
  let items = [];
  if (Array.isArray(newObj.Item)) {
    items = newObj.Item.map((i) => i.trim()).filter((i) => i.length > 0);
  } else if (typeof newObj.Item === "string" && newObj.Item.trim() !== "") {
    // Split by comma if multiple items in a string
    items = newObj.Item.split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  }

  // Create a new Bounty instance using the updated values
  const bountyObj = new Bounty({
    ...newObj,
    Item: items,
    Bounty: formatBounty(newObj.Bounty),
    Sheet_Index: openIndex,
    Wiki_Image: getImageUrl(newObj.Wiki_URL),
  });
  cachedBounties[tier] = bountyObj;
};

const getImageUrl = (wikiURL) => {
  return wikiURL.replace("#", "").replace("/w/", "/images/") + ".png";
};

const formatBounty = (bounty) => {
  let newBounty = parseFloat(bounty);
  let newStr = "";
  if (bounty >= 1) {
    newStr = newBounty.toString() + "M";
  } else {
    newStr = (newBounty * 1000).toString() + "K";
  }
  return newStr;
};

const getTier = (index) => {
  switch (index) {
    case 0:
      return "easy";
    case 1:
      return "medium";
    case 2:
      return "hard";
    case 3:
      return "elite";
    case 4:
      return "master";
    default:
      return "Unknown Tier";
  }
};

const difficultyToTier = (tier) => {
  switch (tier) {
    case "easy":
      return 0;
    case "medium":
      return 1;
    case "hard":
      return 2;
    case "elite":
      return 3;
    case "master":
      return 4;
    default:
      return 0;
  }
}

export { checkSheets, getTier, formatBounty, difficultyToTier };

/*TASKS
Need to do the following:
1. On server start, check if there are no active bounties for each tier, need to find the first array (row of the sheet) that is not marked as completed
2. 
*/
