import { EmbedBuilder } from "discord.js";

export const pk = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "PK Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Skull.png")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  return embed;
};
