import { writeBatchToSheet } from "../../services/sheetService.js";
import { cachedBounties, cachedSheets } from "./cachedData.js";

const WIKI_URL = "https://oldschool.runescape.wiki/";
const MAX_TIERS = 5;

//LEAVING OFF: cached vs google sheets data, how the objects are checked and updated via other code (completion of bounty, etc)

const checkSheets = (allSheetData) => {
  if (cachedSheets.length !== MAX_TIERS) {
    console.log(`Sheets are not cached, updating from new sheet data`);
  } else {
    console.log(`Sheets are cached but making sure to update to new data`);
  }

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
  checkBounties();
};

const checkBounties = async () => {
  console.log(`Now checking bounties`);
  if (cachedBounties.length !== MAX_TIERS) {
    console.log(`Bounties are not cached, updating from cached sheets`);
  }

  if (!cachedSheets || cachedSheets.length === 0) {
    console.log(`There was no cached sheet! returning`);
    return;
  }

  await setNewActiveBounty();
  // console.log(`Finished checking cached bounties, cachedBounties are: `);
  // console.log(cachedBounties);
};

//separate cachedSheets and new sheets functionality? Still have it iterative over their array of objects
const setNewActiveBounty = async () => {
  const newWrites = [];

  cachedSheets.forEach((sheet, tier) => {
    const activeIndex = sheet.findIndex((obj) => obj.Status === "Active");
    if (activeIndex !== -1) {
      updateBounty(sheet[activeIndex], tier, activeIndex + 1);
    } else {
      const openIndex = sheet.findIndex((obj) => obj.Status === "Open");
      if (openIndex !== -1) {
        sheet[openIndex].Status = "Active";
        const writeObj = {
          range: `${getTier(openIndex)}!H${openIndex + 2}`,
          values: [["Active"]],
        };
        newWrites.push(writeObj);
        updateBounty(sheet[openIndex], tier, openIndex + 2);
      } else {
        console.log(
          `Could not find an open index! All might be claimed, need to add functionality`
        );
        cachedBounties[tier].tier_completed = true;
      }
    }
  });

  if (newWrites.length > 0) {
    console.log(`Need to write the new actives to the sheet`);
    await writeBatchToSheet(newWrites);
  }
};

const updateBounty = (newObj, tier, openIndex) => {
  console.log(`Update bounty called for difficulty ${getTier(tier)}`);
  let bounty = parseFloat(newObj.Bounty);
  if (bounty >= 1) {
    bounty = bounty.toString() + "M";
  } else {
    bounty = (bounty * 1000).toString() + "K";
  }
  newObj.Bounty = bounty;
  newObj.Sheet_Index = openIndex;
  newObj.Quantity = 0;
  newObj.Wiki_Image = getImageUrl(newObj.Wiki_URL);
  newObj.tier_completed = false;
  cachedBounties[tier] = newObj;
};

const checkType = (type) => {};

const completeBounty = (tier) => {};

const getImageUrl = (wikiURL) => {
  return wikiURL.replace("#", "").replace("/w/", "/images/") + ".png";
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

export { checkSheets, updateBounty };

/*TASKS
Need to do the following:
1. On server start, check if there are no active bounties for each tier, need to find the first array (row of the sheet) that is not marked as completed
2. 
*/
