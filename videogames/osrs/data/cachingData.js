import { getAllSheetData } from "../../../services/google/osrsSheets.js";
import { modifySheetData } from "../bounties/updateFromSheets.js";
import { updateCachedMembers } from "./discordMembers.js";
import { importRecurring } from "../bounties/recurring/recurring.js";

export const getCachedData = async () => {
  try {
    // cachedBounties, highscores, numberOfBounties should all be updated from updateSheetsFunction
    const sheets = ["easy", "medium", "hard", "elite", "master", "teams"];
    const ranges = [
      "A2:L150",
      "A2:L75",
      "A2:L75",
      "A2:L75",
      "A2:L75",
      "A2:I75",
    ];
    const finalData = sheets.map((sheet, i) => {
      return `${sheet}!${ranges[i]}`;
    });
    const allData = await getAllSheetData(finalData);
    const memberData = allData.pop();
    await modifySheetData(allData);
    await updateCachedMembers(memberData);
    await importRecurring();
    //Need to cache player information format will
  } catch (e) {
    console.log("Error getting cached data: ");
    console.log(e);
    throw e;
  }
};

export const postPlayerRequests = async () => {};
