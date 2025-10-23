import { highscores, players } from "../cachedData.js";
import { difficultyToTier } from "../bounties/bountyUtilities.js";
import { updateBroadcast } from "../../../bot/broadcasts.js";
import { writeBatchToSheet } from "../../../services/google/sheets.js";

// Passed in array of objects
export const updateHighscores = async (newHighscores) => {
  // console.log(`Updating highscores based on data: `);
  // console.log(newHighscores);
  try {
    const sortedHS = sortHighscores(newHighscores);
    let topTenLength = sortedHS.length;
    highscores.length = topTenLength;

    // Update the cached highscores array in place
    for (let i = 0; i < topTenLength; i++) {
      highscores[i] = sortedHS[i];
    }

    // console.log(`Finished updating highscores:`);
    // console.table(highscores);
    await calcTeamPoints();
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

const calcTeamPoints = async () => {
  try {
    Object.keys(players).forEach((key) => {
      const playerIndex = highscores.findIndex((p) => p.Player_Name === key);
      if (playerIndex === -1) {
        // console.log(`Player ${key} not found in highscores`);
        highscores.push({
          Player_Name: key,
          Score: 0,
          TotalBounty: 0,
        });
      }
    });
    const teamPoints = [0, 0, 0];
    highscores.forEach((player) => {
      const p = players[player.Player_Name] ?? null;
      if (p && p.team) {
        const teamIndex = parseInt(p.team) - 1;
        if (teamIndex >= 0 && teamIndex < teamPoints.length) {
          teamPoints[teamIndex] += parseInt(player.Score) + parseInt(p.rp || 0);
        }
      }
      // console.log(
      //   `${player.Player_Name}, Bounty GP: ${player.TotalBounty}, RP: ${
      //     p?.rp || 0
      //   }`
      // );
    });
    console.log(`Calculated team points:`);
    console.log(teamPoints);
    await gpToSheets();
  } catch (error) {
    console.log(`Error calculating team points: ${error}`);
  }
};

export const gpToSheets = async () => {
  try {
    // Posting bounty points and total GP to sheets
    const ranges = [];
    const values = [];
    Object.keys(players).forEach((key) => {
      let data = [];
      let hsPlayer;
      const hsIndex = highscores.findIndex((p) => p.Player_Name === key);
      if (hsIndex === -1) {
        throw new Error(`Player ${key} not found in highscores`);
      }
      hsPlayer = highscores[hsIndex];
      const sheetIndex = players[key].index;
      const sheetRange = `teams!J${sheetIndex}:L${sheetIndex}`;
      if (
        parseFloat(hsPlayer.Score) === 0 &&
        parseFloat(players[key].rp) === 0
      ) {
        // console.log(`Player did not earn any points, will be 0s`);
        data = [[0, 0, 0]];
      } else {
        const rpTotal = parseFloat(players[key].rp * 0.1 || 0);
        const total = parseFloat(hsPlayer.TotalBounty) + rpTotal;
        data.push([hsPlayer.Score, hsPlayer.TotalBounty, total]);
      }
      // console.log(`Pushing data for player ${key}, range: ${sheetRange}`);
      ranges.push(sheetRange);
      values.push(data);
    });
    console.log(`Final ranges and sheets data to write:`);
    // console.log(ranges);
    // console.log(values);
    const finalData = ranges.map((range, index) => {
      return { range: range, values: values[index] };
    });
    // console.log(`Final data to write to sheets: `);
    // console.log(finalData);
    // await writeBatchToSheet(finalData);
  } catch (error) {
    console.log(`Error posting GP to sheets: ${error}`);
  }
};
