import { EmbedBuilder } from "discord.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";

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
  let finalArr = cachedBounties.map((data, index) => {
    if (
      !data ||
      (typeof data === "string" && data.trim() === "") ||
      (typeof data === "object" && Object.keys(data).length === 0) ||
      data.tier_completed === true
    ) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: getTier(index),
          iconURL: getScrollImage(index),
        })
        .setColor(getColor(index))
        .setTitle(`${index}`)
        .addFields({
          name: "No Bounties left in this difficulty!",
          value: "\u200B",
        });
      return embed;
    }
    const scrollImage = getScrollImage(index);
    const tier = getTier(index);
    console.log(`Passed in ${data.Source} for difficulty: ${index}`);
    const embed = new EmbedBuilder()
      .setColor(getColor(index))
      .setTitle(data.Title || "No title attached")
      .setURL(data.Wiki_URL || "https://oldschool.runescape.wiki/")
      .setThumbnail(data.Wiki_Image || "https://oldschool.runescape.wiki/")
      .setAuthor({
        name: tier,
        iconURL: scrollImage,
      });

    if (data.Description) {
      embed.setDescription(data.Description);
    } else {
      embed.setDescription("No description made for this bounty");
    }

    if (data.Bounty) {
      console.log(`Bounty passed in of ${data.Bounty}`);
      embed.addFields({ name: "Bounty", value: data.Bounty });
    } else {
      console.log(`No bounty was passed in for difficulty ${tier}`);
    }
    return embed;
  });

  return finalArr;
};
