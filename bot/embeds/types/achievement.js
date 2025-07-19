import { EmbedBuilder } from "discord.js";

export const achievement = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "CA Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Combat.png")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    });
  return embed;
};
