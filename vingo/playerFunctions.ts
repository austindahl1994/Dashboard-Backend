import { boardMap, playersMap, Player } from "./cachedData.ts"

// Gets player data from sheets
// [
//   [discord, nickname, discord_id, rsn, team, paid, donation]
// ]

const headers : string[] = ["discord", "nickname", "discord_id", "rsn", "team", "paid", "donation"]
const END_COLUMN = "G"
// caches player data
export const cachePlayers = async () : Promise<void> => {
  try {
    if (!playersMap) {
      const sheetsPlayers = await getVingoPlayers()
      formatPlayers(sheetsPlayers) //formats and caches player data
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const formatPlayers = (sheetsPlayers : Array<string[]>) => {
  try {
    sheetsPlayers.forEach((playerRow : [], rowIndex) => {
      const newPlayer = {}
      headers.forEach((header, colIndex) => {
        newPlayer[header] = playerRow[colIndex]
      })
      const player : Player = newPlayer
      playersMap.set(rowIndex + 2, player)
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

// [discord, nickname, discord_id, rsn, team, paid, donation]
// Update single player for buy in to google sheets
const updatePlayer = async (discord_id: string, discord_username: string, discord_nickname: string, rsn: string, donation: string) => {
  try {
    let range : number;
    // Check if player is already on sheets to update some value
    if (playersMap.has(discord_id)) {
      const player = playersMap.get(discord_id)
      range = player.sheets_row
    // player is not on sheets, add them in
    } else {
      range = playersMap.size + 2
    }
    
    const dataToUpdate: string[] = [discord_username, discord_nickname, discord_id, rsn, "0", "YES", donation]
    await updateVingoPlayer(range, dataToUpdate)
  } catch (e) {
    console.log(e)
    throw e
  }
}
