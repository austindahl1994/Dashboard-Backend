import { EmbedBuilder } from "discord.js";
import { cachedBounties } from "../../videogames/osrs/cachedData.js";

const getColor = (index) => {
  switch (index) {
    case 0:
      return 0x229954;
    case 1:
      return 0xf4d03f;
    default:
      return 0xc0392b;
  }
};

export const getEmbeds = () => {
  let finalArr = cachedBounties.map((data, index) => {
    console.log(`Passed in ${data.Source} for tier: ${index}`);
    const embed = new EmbedBuilder()
      .setColor(getColor(index))
      .setTitle(data.Title || "No title attached")
      .setURL(data.Wiki_URL || "https://oldschool.runescape.wiki/")
      .setThumbnail(data.Wiki_Image || "https://oldschool.runescape.wiki/");

    if (data.Description) {
      embed.setDescription(data.Description);
    } else {
      embed.setDescription("No description made for this bounty");
    }

    if (data.Bounty) {
      console.log(`Bounty passed in of ${data.Bounty}`);
      embed.addFields({ name: "Bounty", value: data.Bounty });
    } else {
      console.log(`No bounty was passed in for tier ${index}`);
    }
    return embed;
  });

  return finalArr;
};
