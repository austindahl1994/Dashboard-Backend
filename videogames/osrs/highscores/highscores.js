import { highscores } from "../cachedData.js";
import { difficultyToTier, getTier } from "../bounties/bountyUtilities.js";
import { updateBroadcast } from "../../../bot/broadcasts.js";

export function updateHighscores(newHighscores) {
  try {
    // Update the cached highscores array in place
    let topTenLength = newHighscores.length > 10 ? 10 : newHighscores.length;
    highscores.length = topTenLength;
    for (let i = 0; i < topTenLength; i++) {
      highscores[i] = newHighscores[i];
    }

    console.log(`Finished updating highscores:`);
    console.table(highscores);
    // update the highscores broadcast
    updateBroadcast("highscores");
  } catch (error) {
    console.log(errorconsole.log(error));
  }
}

//expects array of player objects with Player_Name, Score, TotalBounty
const sortHighscores = (hs) => {
  try {
    return hs.sort((a, b) => {
      if (a.Score !== b.Score) {
        return b.Score - a.Score;
      } else {
        return b.TotalBounty - a.Total_Bounty;
      }
    });
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};

export const createCachedHighscores = (sheetData) => {
  try {
    if (highscores.length !== 0) {
      const previousHighscores = structuredClone(highscores);
      console.log(`Previous highscores:`);
      console.table(previousHighscores);
      highscores.length = 0;
    }
    console.log(`Creating highscores from cached sheets`);

    const playerStats = {};

    sheetData.forEach((sheet, tier) => {
      sheet.forEach((bounty) => {
        let player;
        if (bounty.Discord) {
          player = bounty.Discord.trim();
        } else if (bounty.RSN) {
          player = bounty.RSN.trim();
        }

        if (!player || bounty.Status !== "Complete") return;

        // Parse bounty amount (always a float)
        const bountyAmount = parseFloat(bounty.Bounty) || 0;

        if (!playerStats[player]) {
          playerStats[player] = {
            Player_Name: player,
            Score: 0,
            TotalBounty: 0,
          };
        }
        playerStats[player].Score = playerStats[player].Score + 1 * (tier + 1);
        playerStats[player].TotalBounty += bountyAmount;
      });
    });

    // Convert to array and sort
    const newHighscores = sortHighscores(Object.values(playerStats));
    updateHighscores(newHighscores);
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};

const increaseHS = (name, difficulty, gp) => {
  try {
    const existingIndex = highscores.findIndex((playerObj) => {
      return playerObj.Player_Name === name;
    });
    const addition = 1 + difficultyToTier(difficulty);
    console.log(`Attempting to add to hs, existing index: ${existingIndex}`);
    if (existingIndex !== -1) {
      highscores[existingIndex].Score += addition;
      highscores[existingIndex].TotalBounty += parseInt(gp);
    } else {
      const newPlayer = {
        Player_Name: name,
        Score: addition,
        TotalBounty: gp,
      };
      highscores.push(newPlayer);
    }
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};

export const addToHighscores = (discord, rsn, difficulty, bountyValue) => {
  try {
    const discordName = discord || null;
    if (discordName) {
      increaseHS(discordName, difficulty, bountyValue);
    } else if (rsn) {
      increaseHS("RSN: " + rsn, difficulty, bountyValue);
    } else {
      throw new Error(
        "Could not add player info, no valid discord or player name"
      );
    }
    updateHighscores(highscores);
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};
