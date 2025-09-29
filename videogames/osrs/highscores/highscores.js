import { highscores, players } from "../cachedData.js";
import { difficultyToTier } from "../bounties/bountyUtilities.js";
import { updateBroadcast } from "../../../bot/broadcasts.js";

// Passed in array of objects
export const updateHighscores = async (newHighscores) => {
  // console.log(`Updating highscores based on data: `);
  // console.log(newHighscores);
  try {
    // TODO: Need to go through each array of objects from 'newHigscores', checking if Object.Player_Name matches
    // players[Player_Name] for cached players, if so need to increase score with players[Player_Name].rp

    // const modifiedHS = newHighscores.map((obj) => { // Each obj has Player_Name, Score, and TotalBounty
    //   const discord = obj.Player_Name
    //   const player = players[discord] ?? null
    //   if (player) {
    //     console.log(`Player found when updating highscores: ${discord}, RSN: ${player.rsn}, RP: ${player.rp}`)
    //     const summedScore = parseInt(player.rp ?? 0) + parseInt(obj.Score)
    //     const summedBounty = parseInt(player.rp ?? 0) * 0.1 + parseFloat(obj.TotalBounty)
    //     console.log(`Player old TotalBounty: ${obj.TotalBounty} and score: ${obj.Score}`)
    //     console.log(`Player supposed new TotalBounty: ${summedBounty} and score: ${summedScore}`)
    //     return { Player_Name: discord, Score: summedScore, TotalBounty: summedBounty}
    //   } else {
    //     console.log(`Player not found in cached players with discord of: ${discord}`)
    //     return obj
    //   }
    // })

    const sortedHS = sortHighscores(newHighscores);
    let topTenLength = sortedHS.length > 10 ? 10 : sortedHS.length;
    highscores.length = topTenLength;

    // Update the cached highscores array in place
    for (let i = 0; i < topTenLength; i++) {
      highscores[i] = sortedHS[i];
    }

    // console.log(`Finished updating highscores:`);
    // console.table(highscores);
  } catch (error) {
    console.log(error);
  }
};

//expects array of player objects with Player_Name, Score, TotalBounty
const sortHighscores = (hs) => {
  try {
    return hs.sort((a, b) => {
      if (a.Score !== b.Score) {
        return b.Score - a.Score;
      } else {
        return b.TotalBounty - a.TotalBounty;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// Passed in array of arrays of Objects
export const createCachedHighscores = async (sheetData) => {
  try {
    // console.log(`Creating highscores from cached sheets`);
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
        // console.log(`Player: ${player}`);
        // console.log(`Status is: ${status}`);
        if (
          !player ||
          !status ||
          status.toLowerCase() === "open" ||
          status.toLowerCase() === "skipped"
        ) {
          // console.log(`No player or status is open/skipped`);
          return;
        }

        // Parse bounty amount (always a float)
        const bountyAmount = parseFloat(bounty.Bounty) || 0;

        if (!playerStats[player]) {
          // console.log(
          //   `${player} was not a part of the highscores, adding them in`
          // );
          playerStats[player] = {
            Player_Name: player,
            Score: 0,
            TotalBounty: 0,
            // BP: 0
          };
        }
        playerStats[player].Score =
          parseInt(playerStats[player].Score) + 1 * (tier + 1);
        playerStats[player].TotalBounty =
          parseFloat(playerStats[player].TotalBounty) +
          parseFloat(bountyAmount);
      });
    });

    //TEMP: Comparing HS against Players for data
    Object.keys(playerStats).forEach((key) => {
      // console.log(`Player for highscores: ${key}`)
      // console.log(`Comparing highscores playerStats discord name against cached players`)
      if (players[key]) {
        console.log(`Player ${key} found in cached players!`);
        console.log(
          `RSN: ${players[key].rsn}, Score: ${playerStats[key].Score}, RP: ${players[key].rp}`
        );
      } else {
        // console.log(`Player with Discord: ${key} not found from highscores`)
      }
    });

    // Convert to array and sort
    // console.log(`playerStats before sort:`);
    // console.log(Object.values(playerStats));
    // const newHighscores = sortHighscores(Object.values(playerStats));
    await updateHighscores(Object.values(playerStats)); //sorting in update instead
    await updateBroadcast("highscores");
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
};
