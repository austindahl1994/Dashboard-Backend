import { highscores } from "../cachedData.js";
import { difficultyToTier } from "../bounties/bountyUtilities.js";
import { updateBroadcast } from "../../../bot/broadcasts.js";

export const updateHighscores = async (newHighscores) => {
  console.log(`Updating highscores based on data: `);
  console.log(newHighscores);
  try {
    // Update the cached highscores array in place
    let topTenLength = newHighscores.length > 10 ? 10 : newHighscores.length;
    highscores.length = topTenLength;
    for (let i = 0; i < topTenLength; i++) {
      highscores[i] = newHighscores[i];
    }

    console.log(`Finished updating highscores:`);
    console.table(highscores);
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};

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

export const createCachedHighscores = async (sheetData) => {
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
          // console.log(`Player discord existed: ${player}`);
        } else if (bounty.RSN) {
          player = "RSN: " + bounty.RSN.trim();
          // console.log(`Player discord did not exist so player is: ${player}`);
        } else {
          // console.log(`No player data for this row`);
          return;
        }
        const status = bounty.Status.trim().toLowerCase();
        console.log(`Player: ${player}`);
        console.log(`Status is: ${status}`);
        if (!player || !status || status === "open" || status === "skipped") {
          // console.log(`No player or status is open/skipped`);
          return;
        }

        // Parse bounty amount (always a float)
        const bountyAmount = parseFloat(bounty.Bounty) || 0;

        if (!playerStats[player]) {
          console.log(
            `${player} was not a part of the highscores, adding them in`
          );
          playerStats[player] = {
            Player_Name: player,
            Score: 0,
            TotalBounty: 0,
          };
        }
        playerStats[player].Score =
          parseInt(playerStats[player].Score) + 1 * (tier + 1);
        playerStats[player].TotalBounty =
          parseFloat(playerStats[player].TotalBounty) +
          parseFloat(bountyAmount);
      });
    });

    // Convert to array and sort
    console.log(`playerStats before sort:`);
    console.log(Object.values(playerStats));
    const newHighscores = sortHighscores(Object.values(playerStats));
    await updateHighscores(newHighscores);
    await updateBroadcast("highscores");
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
      highscores[existingIndex].Score =
        parseInt(highscores[existingIndex].Score) + addition;
      highscores[existingIndex].TotalBounty =
        parseFloat(highscores[existingIndex].TotalBounty) + parseFloat(gp);
    } else {
      const newPlayer = {
        Player_Name: name,
        Score: addition,
        TotalBounty: parseFloat(gp),
      };
      highscores.push(newPlayer);
    }
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};

export const addToHighscores = async (
  discord,
  rsn,
  difficulty,
  bountyValue
) => {
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
    await updateHighscores(highscores);
  } catch (error) {
    console.log(errorconsole.log(error));
  }
};
