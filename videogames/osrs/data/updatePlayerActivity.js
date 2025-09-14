import { playerRequests } from "../cachedData.js"

const headers = [
  "rsn",
  "discord",
  "DEATH",
  "LOOT",
  "BARBARIAN_ASSAULT_GAMBLE",
  "SPEEDRUN",
  "PLAYER_KILL",
  "seek",
  "items",
  "killer",
  "other",
  "totalPosts"
]
//TODO: Remember to add time for controller to see what time requests were made
// Updates the playerRequests object with newest player data
export const dinkToActivity = (dinkData) => {
  try {
    const rsn = dinkData.playerName
    const bountyType = dinkData.type
    const killerName = dinkData?.extra?.killerName ?? null
    const discordName = dinkData?.discordUser?.name ?? null
    const items = dinkData?.extra?.items ?? []
    if (!playerRequests[rsn]) {
      createActivity(rsn, discordName)
    } 
    compareActivity(playerRequests[rsn], bountyType, killerName, items)
  } catch (e) {
    console.log(`Error updating cached player activity: ${e}`)
  }
}

const createActivity = (rsn, dn) => {
  playerRequests[rsn] = {
    discord: dn || "",
    DEATH: 0,
    LOOT: 0,
    BARBARIAN_ASSAULT_GAMBLE: 0,
    SPEEDRUN: 0,
    PLAYER_KILL: 0,
    seek: 0,
    items: [],
    killer: [],
    other: [],
    index: null,
    totalPosts: 1
  }
}

const updateActivity = (p, bt, kn, items) => {
  p.totalPosts++
  let typeIndex = -1;
  if (bt != null) {
    typeIndex = p.killer.findIndex(obj => bt in obj);
  }
  
  let killerIndex = -1;
  if (kn != null) {
    killerIndex = p.killer.findIndex(obj => kn in obj);
  }
  // Increment bounty type
  if (p[bt]) {
    p[bt]++
  } else if (typeIndex !== -1){
    p.other[typeIndex][bt]++
  } else if (bt) {
    p.other.push({[bt]: 1})
  }
  //increment or add what killed player
  if (bt === "DEATH") {
    if (kn && killerIndex !== -1) {
      p.killer[killerIndex][kn]++
    } else if (kn) {
      p.killer.push({[kn]: 1})
    } else {
      p.seek++
    }
  }
  //Add item:quantity to items array
  if (bt === "LOOT" && items.length > 0) {
    items.forEach((item) => {
      const itemIndex =  p.items.findIndex(obj => item.name in obj)
      if (itemIndex !== -1) {
        p.items[itemIndex][item.name]++
      } else {
        if (item.criteria[0] !== "ALLOWLIST") {
          p.items.push({
            [`BADITEM-${item.name}`]:parseInt(item.quantity)
          })
        } else {
          p.items.push({[item.name]: parseInt(item.quantity)})
        }
      }
    })
  }
}

const importActivity = async () => {
  try {
    const sheetsObj = {} //transform sheet 2d array into object of rsn objects for faster lookup
    const sheetsActivity = await someSheetsFn() // [[row1a, row1b][row2]...]
    if (sheetsActivity.length > 0) {
      sheetsActivity.forEach((row, index) => {
        const obj = {}
        const rsn = row[0]
        headers.slice(1, headers.length - 1).forEach((key, i) => {
          const cell = row[i + 1]
          // check if should be string or array
          if (typeof cell === "string" && cell.includes(',') && cell.length > 0) {
            // ["e:1"]
            obj[key] = cell.split(',').map((str) => {
              const [k, v] = str.trim().split(' ')
              return {[k]: v}
            })
          } else if (cell.length > 0){
            obj[key] = cell
          } else {
            obj[key] = null
          }
        })
        obj.index = index + 2
        sheetsObj[rsn] = obj
      })
      return sheetsObj
  } catch (e) {
    console.log(`Error importing sheets activity: ${e}`)
  }
}

// called by cronjob, imports player data from sheets, merges data with player requests, exports merged data back to sheets
// compares arrays of rows against single object, where keys are usernames
// if the playerRequests includes the rsn, merge them into arrayand keep sheet index, if not then ignore it (), then for 
// keys that are not marked for merge, add them to the data being batch updated
export const mergeActivity = async () => {
  try {
    const finalData = [] //array of {range: row, values: [[cells]]}
    const sheetsObj = await importActivity()
    if (Object.keys(sheetsObj).length === 0) {
      // Add data from cached playerActivity
      Object.keys(playerRequests).forEach((rsn, index) => {
        addActivityToFinalData(rsn, index)
      })
    } else {
      // Merge sheets and cached data together
      Object.keys(playerRequests).forEach((rsn) => {
        if (sheetsObj[rsn]) {
          // If it exists in sheets object, merge them together
        } else {
          // If it doesn't exist in sheets object, should add it's data individually
        }
      })
    }
    if (finalData.length > 0) {
      await exportActivity(finalData)
      playerRequests = {}
    } else {
      throw new Error('No data to be updated!')
    }
  } catch (e) {
    console.log(`Error merging activities: ${e}`)
  }
}

const addActivityToFinalData = (rsn, index) => {
  p = playerRequests[rsn]
  const playerData = []
  playerData.push(rsn)
  headers.slice(1, headers.length).forEach((key, index) => {
    if (Array.isArray(p[key])) {
      const str = p[key].map((obj) => Object.entries(obj).join(' ')).join(', ')
      playerData.push(str)
    } else {
      playerData.push(p[key])
    }
  }) 
  return {
  range: `activity!A${index + 2}:L${index + 2}`,
  values: [playerData]
  }
}

const exportActivity = async () => {
  try {
    
  } catch (e) {
    console.log(`Error updating sheets activity: ${e}`)
  }
}
