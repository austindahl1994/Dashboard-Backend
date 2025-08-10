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
    addToHighscores(
      data.discordUser,
      data.playerName,
      bounty.Difficulty,
      bounty.Bounty
    );
    //Update sheets data after fully updating the object
    const completedBounty = {
      Title: bounty.Title,
      Difficulty: bounty.Difficulty,
      Discord: data.discordUser || null,
      RSN: data.playerName,
      S3_URL: imageUrl,
      Bounty: bounty.Bounty,
    };
    const dataToUpdate = ["COMPLETED", bounty.RSN, bounty.Discord, imageUrl];
    await osrsSheets.completeBounty(
      bounty.Difficulty,
      bounty.Sheet_Index,
      dataToUpdate
    );
    //After getting google data, based on difficulty manually set the data based on index against difficulty
    //Import the new difficultyToTier() function in utilities
    await broadcastBountyCompletion(completedBounty);
    await updateBroadcast("highscores");
    await updateBroadcast("bounties");
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
    // If no data for one passed in, throw error
    if (!difficulty || !id || !discord || !imageUrl) {
      throw new Error(
        "Missing required parameters to manually complete bounty."
      );
    }
    console.log(
      `Manually completing bounty with ID: ${id} on ${difficulty} difficulty.`
    );

    // Find the bounty in cachedBounties based on id and difficulty
    const idIndex = cachedBounties.findIndex((bounty) => {
      // console.log(
      //   `Checking bounty with ID: ${bounty.Id} and difficulty: ${bounty.Difficulty}`
      // );
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
    await osrsSheets.markManuallyCompleted(
      difficulty,
      id + 1,
      discord,
      imageUrl
    );
    console.log(
      `Successfully marked bounty with ID ${id} on ${difficulty} difficulty as manually completed.`
    );
    addToHighscores(discord, null, difficulty, cachedBounties[idIndex].Bounty);
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
