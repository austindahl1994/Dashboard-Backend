import { updateSimpleSources } from "./bountyUpdates.js";
import * as compare from "./compareData.js"

//TODO: Figure out when we should check simple cached data, whenever bounties are updated I think would be best
// change to update on bounty update instead
// if (simpleTypes.length === 0) {
//     updateSimpleTypes();
//   }
const handlers = {
  LOOT: compare.loot,
  CLUE: compare.clue,
  DEATH: compare.death,
  PET: compare.pet,
  SPEEDRUN: compare.speedrun,
  BARBARIAN_ASSAULT_GAMBLE: compare.ba,
  PLAYER_KILL: compare.pk
};

const checkBounties = (data) => {
  if (!data.type || data.type.trim() === "") {
    throw new Error("No type was passed in")
  } else {
    const trimmedType = type.trim(); 
    const handler = handlers[trimmedType];
  
    if (handler) {
      return handler(data); 
    } else {
      throw new Error(`Type ${type} is recognized but has no specific check implemented.`);
    }
  }
};
