import {
  broadcastBountyCompletion,
  updateBroadcast,
} from "../../../bot/broadcasts.js";
import * as osrsSheets from "../../../services/google/osrsSheets.js";
import { cachedBounties } from "../cachedData.js";
import { addToHighscores } from "../highscores/highscores.js";

export const completeBounty = async (data, bounty, imageUrl) => {
  try {
    //Update highscores and post to correct discord channel
    await addToHighscores(
      data.discordUser.name,
      data.playerName,
      bounty.Difficulty,
      bounty.Bounty
    );
    //Update sheets data after fully updating the object
    const completedBounty = {
      Title: bounty.Title,
      Difficulty: bounty.Difficulty,
      Discord: data.discordUser.name || null,
      RSN: data.playerName,
      S3_URL: imageUrl,
      Bounty: bounty.Bounty,
      Type: bounty.Type,
      Other: bounty.Other,
    };
    const dataToUpdate = [
      "COMPLETED",
      bounty.RSN,
      data.discordUser.name,
      imageUrl,
    ];
    await osrsSheets.completeBounty(
      bounty.Difficulty,
      bounty.Sheet_Index,
      dataToUpdate
    );
    //After getting google data, based on difficulty manually set the data based on index against difficulty
    //Import the new difficultyToTier() function in utilities
    await broadcastBountyCompletion(completedBounty);
  } catch (error) {
    throw new Error(
      `Error completing ${bounty.Difficulty} ${bounty.id}: ${error.message}`
    );
  }
};

export const manuallyCompleteBounty = async (
  difficulty,
  id,
  discord,
  imageUrl
) => {
  try {
    if (!difficulty || !id || !discord || !imageUrl) {
      throw new Error(
        "Missing required parameters to manually complete bounty."
      );
    }
    console.log(
      `Manually completing bounty with ID: ${id} on ${difficulty} difficulty.`
    );

    const idIndex = cachedBounties.findIndex((bounty) => {
      return (
        parseInt(bounty.Id) === parseInt(id) &&
        bounty.Difficulty.trim() === difficulty.trim()
      );
    });

    if (idIndex === -1) {
      throw new Error(
        `Bounty with ID ${id} and difficulty ${difficulty} not found.`
      );
    }
    const completedBounty = {
      Title: cachedBounties[idIndex].Title,
      Difficulty: cachedBounties[idIndex].Difficulty,
      Discord: discord,
      RSN: null,
      S3_URL: imageUrl,
      Bounty: cachedBounties[idIndex].Bounty,
    };
    const sheetIndex = cachedBounties[idIndex].Sheet_Index;
    await osrsSheets.markManuallyCompleted(
      difficulty,
      sheetIndex,
      discord,
      imageUrl
    );
    console.log(
      `Successfully marked bounty with ID ${id} on ${difficulty} difficulty as manually completed.`
    );
    await addToHighscores(
      discord,
      null,
      difficulty,
      cachedBounties[idIndex].Bounty
    );
    await broadcastBountyCompletion(completedBounty);
    await updateBroadcast("highscores");
    await updateBroadcast("bounties");
  } catch (error) {
    throw error;
  }
};

// const dataToUpdate = {
//   status: "COMPLETED",
//   discord: bounty.Discord_Name || "",
//   rsn: bounty.RSN,
//   s3_url: bounty.S3_URL,
// };
