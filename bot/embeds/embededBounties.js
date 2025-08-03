import { EmbedBuilder } from "discord.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";
import { clue } from "./types/clue.js";
import { loot } from "./types/loot.js";
import { death } from "./types/death.js";
import { pet } from "./types/pet.js";
import { speedrun } from "./types/speedrun.js";
import { ba } from "./types/ba.js";
import { pk } from "./types/pk.js";
import { getColor, getTier, getScrollImage } from "./embedUtilities.js"

const handlers = {
  LOOT: loot,
  CLUE: clue,
  DEATH: death,
  PET: pet,
  SPEEDRUN: speedrun,
  BARBARIAN_ASSAULT_GAMBLE: ba,
  PLAYER_KILL: pk,
};

export const getAllBountyEmbeds = () => {
  let finalArr = cachedBounties.map((data, index) => {
    if (
      !data ||
      (typeof data === "string" && data.trim() === "") ||
      (typeof data === "object" && Object.keys(data).length === 0) ||
      data.Tier_completed === true
    ) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: getTier(index),
          iconURL: getScrollImage(index),
        })
        .setColor(getColor(index))
        .addFields({
          name: "No Bounties left in this difficulty!",
          value: "\u200B",
        });
      return embed;
    }
    const scrollImage = getScrollImage(index);
    const tier = getTier(index);
    const color = getColor(index);

    const handler = handlers[data.Type] || loot;
    
    return handler(data, tier, scrollImage, color);
    
  });

  return finalArr;
};

  // console.log(`Called getEmbeds with cachedBounties:`);
  // cachedBounties.forEach((bounty, index) => {
  //   console.table(bounty);
  // });
    // switch (data.Type) {
    //   case "LOOT":
    //     return loot(data, tier, scrollImage, color);
    //   case "CLUE":
    //     return clue(data, tier, scrollImage, color);
    //   case "LEVEL":
    //     return level(data, tier, scrollImage, color);
    //   case "COMBAT_ACHIEVEMENT":
    //     return achievement(data, tier, scrollImage, color);
    //   case "DEATH":
    //     return death(data, tier, scrollImage, color);
    //   case "PET":
    //     return pet(data, tier, scrollImage, color);
    //   case "SPEEDRUN":
    //     return speedrun(data, tier, scrollImage, color);
    //   case "BARBARIAN_ASSAULT_GAMBLE":
    //     return ba(data, tier, scrollImage, color);
    //   case "PLAYER_KILL":
    //     return pk(data, tier, scrollImage, color);
    //   default:
    //     return loot(data, tier, scrollImage, color);
    // }
    // // Use different embed builders based on type
    // if (data.Type === "LOOT") {
    //   return loot(data, index, tier, scrollImage);
    // } else if (data.Type === "CLUE") {
    //   return clue(data, index, tier, scrollImage);
    // } else {
    //   return lootEmbed(data, index, tier, scrollImage);
    // }
