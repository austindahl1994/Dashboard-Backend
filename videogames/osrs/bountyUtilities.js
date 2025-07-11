import { writeBatchToSheet } from "../../services/sheetService.js";
import { cachedBounties, cachedSheets } from "./cachedData.js";

const MAX_TIERS = 3;

const checkSheets = (allSheetData) => {
  console.log(`Checking if sheets are cached`);

  // Only cache if not already done
  if (cachedSheets.length !== MAX_TIERS) {
    console.log(`Sheets are not cached, updating from new sheet data`);

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
  }

  console.log(`Finished caching sheets, data:`);
  console.log(cachedSheets);
  checkBounties();
};

const checkBounties = async () => {
  console.log(`Now checking bounties`);
  if (cachedBounties.length !== MAX_TIERS) {
    if (!cachedSheets || cachedSheets.length === 0) {
      console.log(`There was no cached sheet! returning`);
      return;
    }
    const newWrites = [];
    cachedSheets.forEach((sheet, tier) => {
      //finds the row where status is active, meaning its the current bounty of that tier
      const activeIndex = sheet.findIndex((obj) => obj.Status === "Active");
      if (activeIndex !== -1) {
        // console.log(
        //   `Found Active bounty for tier ${tier + 1} at index: ${activeIndex}`
        // );
        updateBounty(sheet[activeIndex], tier, activeIndex + 1);
      } else {
        //console.log(`No active bounty was found, need to find next open`);
        const openIndex = sheet.findIndex((obj) => obj.Status === "Open");
        if (openIndex !== -1) {
          // console.log(
          //   `Found Open bounty for tier ${tier + 1} at index: ${openIndex}`
          // );
          // console.log(
          //   `Need to add functionality for updating sheet after updating cachedBounties`
          // );
          sheet[openIndex].Status = "Active";
          //UPDATE STATUS CHANGE TO ACTIVE IN GOOGLE SHEET AS WELL AT `tier${tier}!G${openIndex}`
          const writeObj = {
            range: `tier${tier + 1}!G${openIndex + 2}`,
            values: [["Active"]],
          };
          newWrites.push(writeObj);
          updateBounty(sheet[openIndex], tier, openIndex + 2);
        } else {
          console.log(
            `Could not find an open index! All might be claimed, need to add functionality`
          );
        }
      }
    });

    if (newWrites.length > 0) {
      console.log(`Need to write the new actives to the sheet`);
      await writeBatchToSheet(newWrites);
    }
  }

  console.log(`Finished checking cached bounties, cachedBounties are: `);
  console.log(cachedBounties);
};

const updateBounty = (newObj, tier, index) => {
  console.log(`Update bounty called for tier ${tier}`);
  newObj.Sheet_Index = index;
  newObj.Number_Slain = 0;
  cachedBounties[tier] = newObj;
};

const completeBounty = (tier) => {};

const getBounties = () => {
  return cachedBounties;
};

export { checkSheets, updateBounty, getBounties };

/*TASKS
Need to do the following:
1. On server start, check if there are no active bounties for each tier, need to find the first array (row of the sheet) that is not marked as completed
2. 
*/
