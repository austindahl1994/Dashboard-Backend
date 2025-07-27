import * as compare from "./compareData.js"

const handlers = {
  LOOT: compare.loot,
  CLUE: compare.clue,
  DEATH: compare.death,
  PET: compare.pet,
  SPEEDRUN: compare.speedrun,
  BARBARIAN_ASSAULT_GAMBLE: compare.ba,
  PLAYER_KILL: compare.pk
};

const checkBounties = async (data) => {
  if (!data.type || data.type.trim() === "") {
    throw new Error("No type was passed in")
  } else {
    const trimmedType = data.type.trim(); 
    console.log(trimmedType)
    const handler = handlers[trimmedType];
  
    if (handler) {
      const completedBounties = cachedBounties.filter((bounty) => {
        if (!bounty.Completed && !bounty.Tier_completed) {
          handler(data, bounty)
        } 
      })
      if (completedBounties.length > 0) {
        return completedBounties
      } else {
        throw new Error(`Data did not match any current bounties`)
      }
    } else {
      throw new Error(`Type ${type} is recognized but has no specific check implemented.`);
    }
  }
};

//Move this to the controller, that way we can delete the image immediately after URL is created
const completeBounty = async (bounty, img) => {
  //mark bounty as complete
  bounty.Completed = true
  //save the img to 
}
