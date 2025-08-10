import * as compare from "./compareData.js";
import { cachedBounties } from "../cachedData.js";

export const checkBounties = (data) => {
  if (!data.type || data.type.trim() === "") {
    throw new Error("No type was passed in");
  }
  const trimmedType = data.type.trim().toLowerCase();
  // console.log(trimmedType);
  const completedBounties = cachedBounties.filter((bounty) => {
    if (
      !bounty.Completed &&
      !bounty.Tier_completed &&
      bounty.Type.toLowerCase() === trimmedType
    ) {
      switch (trimmedType) {
        case "loot":
          return compare.loot(data, bounty);
        case "clue":
          return compare.clue(data, bounty);
        case "death":
          return compare.death(data, bounty);
        case "speedrun":
          return compare.speedrun(data, bounty);
        case "barbarian_assault_gamble":
          return compare.ba(data, bounty);
        case "player_kill":
          return compare.pk(data, bounty);
        default:
          return false;
      }
    }
    // console.log(`Types didnt match`);
    return false;
  });

  return completedBounties;
};
