import { getAllSheetData } from "../../../services/google/osrsSheets.js";
import { modifySheetData } from "../bounties/updateFromSheets.js";
import { players } from "../cachedData.js";
import { updateCachedMembers } from "./discordMembers.js";

export const getCachedData = async () => {
  try {
    // cachedBounties, highscores, numberOfBounties should all be updated from updateSheetsFunction
    const sheets = ["easy", "medium", "hard", "elite", "master", "members"];
    const ranges = [
      "A2:L75",
      "A2:L75",
      "A2:L75",
      "A2:L75",
      "A2:L75",
      "A2:H500",
    ];
    const finalData = sheets.map((sheet, i) => {
      return `${sheet}!${ranges[i]}`;
    });
    const allData = await getAllSheetData(finalData);
    const memberData = allData.pop();
    modifySheetData(allData);
    updateCachedMembers(memberData);
    //Need to cache player information format will
  } catch (e) {
    console.log("Error getting cached data: ");
    console.log(e);
    throw e;
  }
};

export const postPlayerRequests = async () => {};
