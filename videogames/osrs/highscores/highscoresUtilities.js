import { cachedSheets, highscores } from "../cachedData.js";

//update this so that players get points * tier
export function updateHighscores() {
  if (highscores.length !== 0) {
    const previousHighscores = structuredClone(highscores);
    console.log(`Previous highscores:`);
    console.table(previousHighscores);
    highscores.length = 0;
  }
  console.log(`Creating highscores from cached sheets`);

  const playerStats = {};

  cachedSheets.forEach((sheet, tier) => {
    sheet.forEach((bounty) => {
      const player = bounty.Player_Name?.trim();
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
  const newHighscores = Object.values(playerStats).sort((a, b) => {
    if (b.Score !== a.Score) return b.Score - a.Score;
    return b.TotalBounty - a.TotalBounty;
  });

  // Update the cached highscores array in place
  highscores.length = newHighscores.length;
  for (let i = 0; i < newHighscores.length; i++) {
    highscores[i] = newHighscores[i];
  }

  console.log(`Finished updating highscores:`);
  console.table(highscores);
}
