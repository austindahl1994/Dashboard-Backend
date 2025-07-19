import { EmbedBuilder } from "discord.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";
import { clue } from "./types/clue.js";
import { loot } from "./types/loot.js";
import { level } from "./types/level.js";
import { achievement } from "./types/achievement.js";
import { death } from "./types/death.js";
import { pet } from "./types/pet.js";
import { speedrun } from "./types/speedrun.js";
import { ba } from "./types/ba.js";
import { pk } from "./types/pk.js";

const getColor = (index) => {
  switch (index) {
    case 0: // Easy - Green
      return 0x229954;
    case 1: // Medium - Turquoise
      return 0x00ced1;
    case 2: // Hard - Purple
      return 0x8e44ad;
    case 3: // Elite - Yellow
      return 0xffd700;
    case 4: // Master - Red
      return 0xc0392b;
    default: // Beginner - Gray
      return 0xa4a4a4;
  }
};

const getTier = (index) => {
  switch (index) {
    case 0:
      return "Easy";
    case 1:
      return "Medium";
    case 2:
      return "Hard";
    case 3:
      return "Elite";
    case 4:
      return "Master";
    default:
      return "Unknown Tier";
  }
};

const getScrollImage = (index) => {
  switch (index) {
    case 0:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28easy%29_detail.png";
    case 1:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28medium%29_detail.png";
    case 2:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28hard%29_detail.png";
    case 3:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28elite%29_detail.png";
    case 4:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28master%29_detail.png";
    default:
      return "https://oldschool.runescape.wiki/images/Clue_scroll_%28beginner%29_detail.png";
  }
};

export const getEmbeds = () => {
  // console.log(`Called getEmbeds with cachedBounties:`);
  // cachedBounties.forEach((bounty, index) => {
  //   console.table(bounty);
  // });
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

    switch (data.Type) {
      case "LOOT":
        return loot(data, tier, scrollImage, color);
      case "CLUE":
        return clue(data, tier, scrollImage, color);
      case "LEVEL":
        return level(data, tier, scrollImage, color);
      case "COMBAT_ACHIEVEMENT":
        return achievement(data, tier, scrollImage, color);
      case "DEATH":
        return death(data, tier, scrollImage, color);
      case "PET":
        return pet(data, tier, scrollImage, color);
      case "SPEEDRUN":
        return speedrun(data, tier, scrollImage, color);
      case "BARBARIAN_ASSAULT_GAMBLE":
        return ba(data, tier, scrollImage, color);
      case "PLAYER_KILL":
        return pk(data, tier, scrollImage, color);
      default:
        return loot(data, tier, scrollImage, color);
    }
    // Use different embed builders based on type
    if (data.Type === "LOOT") {
      return loot(data, index, tier, scrollImage);
    } else if (data.Type === "CLUE") {
      return clue(data, index, tier, scrollImage);
    } else {
      return lootEmbed(data, index, tier, scrollImage);
    }
  });

  return finalArr;
};
