import { EmbedBuilder } from "discord.js";

export const level = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Level Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Stats_icon.png")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    });
  return embed;
};
