import { cachedData, simpleSources, simpleItems } from '../cachedData.js'

//If data doesn't match bounties, throw an error to immediately clear file data/image
//If after the await compareData(parsedData) no error thrown, then it matches a current Bounty

const ce = (input) => {
  throw new Error(`${input ? input : data} did not match current bounties`)
}

//Do a check beforehand for extra.npc === false for guaranteed not pvp?
const loot = async (data) => {
  const itemsMatch = false
  const s = data.extra.source
  if (!simpleSources.includes("*") && !simpleSources.includes(s)) {
    ce("Source")
  } else if (simpleSources.includes(s)) {
    cachedBounties.forEach((bounty) => {
      if (bounty.Source === s) {
        bounty.Quantity += 1
      }
    })
  }

  for (let item of data.extra.items) {
    if (simpleSources.includes(item)) {
      itemsMatch = true
      return
    }
  }
  
  if (!itemsMatch) {
    ce("Items")
  }
}

const ba = async (data) => {
  
}

const death = async (data) => {
  
}

const clue = async (data) => {
  
}

const pet = async (data) => {
  
}

const speedrun = async (data) => {
  
}

const pk = async (data) => {
  
}
