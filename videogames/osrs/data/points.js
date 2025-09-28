import { players } from "../cachedData.js"
import { formatBounty } from "../bounties/bountyUtilities.js"
const gpTotals = [0.5, 1, 3, 5, 10]
// Displays points earned for each team
export const checkPoints = (allSheets) => {
  try {
    const keys = Object.keys(players) ?? []
    if (keys.length === 0) {
      throw new Error("No players are cached")
    }
    const totalRP = 0
    const claimedGP = 0
    const claimedPoints = 0
    const availableGP = 0
    const availablePoints = 0
    const teamPoints = [0, 0, 0]
    const teamGP = [0, 0, 0]
    keys.forEach((discordUsername) => { // Player earned points through recurring bounties
      const player = players[discordUsername]
      const index = parseInt(player.team)
      const playerRp = parseInt(player.rp)
      totalRP += playerRp
      teamPoints[index - 1] += playerRp ?? 0
    })
    // Now using array of array of objects, get GP spent + calc the points for each team
    // Outer array indices signify each sheets difficulty
    // Inner arrays contain objects that represent each row of specified tier
    allSheets.forEach((sheet, tabIndex) => {
      const gpValue = gpTotals[tabIndex]
      sheet.forEach((rowObj) => {
        // calc the GP and points earned based on tabIndex if rowObj.Status.toLowerCase() === "completed" ||
        // rowObj.Status.toLowerCase() === "manually claimed"
        const status = rowObj.Status.toLowerCase()
        const player = players[rowObj.Discord] ?? null
        if (status === "completed" || status === "manually claimed") {
          claimedGP += gpValue
          claimedPoints += tabIndex + 1
          if (!player) {
            console.log(`Player from sheets with discord: ${rowObj.Discord} was not found in cached players`)
          } else {
            const teamNumber = parseInt(player.team)
            teamGP[teamNumber - 1] += gpValue
            teamPoints[teamNumber - 1] += tabIndex + 1
          }
        // calc the remaining GP and points if rowObj.Status.toLowerCase() === "open" 
        } else if (status === "open") {
          availableGP += gpValue
          availablePoints += tabIndex + 1
        }
      })
    })
    displayResults({ totalRP, claimedGP, availableGP, availablePoints, teamPoints, teamGP, claimedPoints })
  } catch (error) {
    console.log(`Error calcing points or GP from sheets: ${error}`)
    throw error
  }
}

const displayResults = (data) => {
  const { totalRP, claimedGP, availableGP, availablePoints, teamPoints, teamGP, claimedPoints } = data;
  const generalTable = [
    { Label: "Total Recurring points", Value: totalRP },
    { Label: "Claimed GP", Value: formatBounty(claimedGP) },
    { Label: "Claimed Points", Value: claimedPoints },
    { Label: "Available GP", Value: formatBounty(availableGP) },
    { Label: "Available Points", Value: availablePoints }
  ];
  
  // Table 2: Team Points
  const teamTable = [
    { Team: "Hard Sox", Points: teamPoints[0], GP: formatBounty(teamGP[0]) },
    { Team: "Draynor Cabbage Mafia", Points: teamPoints[1], GP: formatBounty(teamGP[0]) },
    { Team: "Futt Buckers", Points: teamPoints[2], GP: formatBounty(teamGP[0]) }
  ];
  
  // Output
  console.table(generalTable);
  console.table(teamTable);
}
