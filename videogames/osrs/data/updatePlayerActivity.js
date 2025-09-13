import { playerRequests } from "../cachedData.js"
//TODO: Remember to add time for controller to see what time requests were made
// Updates the playerRequests array with newest player data
export const updateActivity = (dinkData) => {
  try {
    const username = dinkData.playerName
    const bountyType = dinkData.type
    const killerName = dinkData.
  } catch (e) {
    console.log(`Error updating cached player activity: ${e}`)
  }
}

// called by cronjob, imports player data from sheets, merges data with player requests, exports merged data back to sheets
export const exportActivity = async () => {
  try {
    
  } catch (e) {
    console.log(`Error updating sheets activity: ${e}`)
  }
}
