import { cachedSheets, highscores } from "../cachedData.js";
import { getTier } from "../bounties/bountyUtilities.js"

export function updateHighscores(newHighscores) {
  // Update the cached highscores array in place
  let topTenLength = newHighscores.length > 10 ? 10 : newHighscores.length
  highscores.length = topTenLength;
  for (let i = 0; i < topTenLength; i++) {
    highscores[i] = newHighscores[i];
  }

  console.log(`Finished updating highscores:`);
  console.table(highscores);
}

//expects array of player objects with Player_Name, Score, TotalBounty
const sortHighscores = (hs) => {
  return hs.sort((a, b) => {
    if (a.Score !== b.Score) {
      return b.Score - a.Score
    } else {
      return b.TotalBounty - a.Total_Bounty
    }
  })
}

export const createCachedHighscores = (sheetData) => {
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
        playerStats[player] = { Player_Name: player, Score: 0, TotalBounty: 0 };
      }
      playerStats[player].Score = playerStats[player].Score + 1 * (tier + 1);
      playerStats[player].TotalBounty += bountyAmount;
    });
  });

  // Convert to array and sort
  const newHighscores = sortHighscores(Object.values(playerStats))
  updateHighscores(newHighscores)
}

const increaseHS = (name, tier, gp) => {
  const existingIndex = highscores.indexOf((playerObj) => {
    return playerObj.Player_Name === name
  })
  if (existingIndex) {
    highscores[existingIndex].Score += difficultyToTier(tier)
    highscores[existingIndex].TotalBounty += parseInt(gp)
  } else {
    const newPlayer = {
      Player_Name: name,
      Score: 1 + difficultyToTier(tier),
      TotalBounty: gp
    }
    highscores.push(newPlayer)
  }
}

export const addToHighscores = (data, bountyTier, bountyValue) => {
  const discordName = data?.discordUser?.name
  const rsn = data?.playerName
  if (discordName) {
    increaseHS(discordName, bountyTier, bountyValue)
  } else if (rsn) {
    increaseHS("RSN: ", bountyTier, bountyValue)
  } else {
    throw new Error("Could not add player info, no valid discord or player name")
  }
  updateHighscores(highscores)
}
