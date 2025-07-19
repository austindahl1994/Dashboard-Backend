import { EmbedBuilder } from "discord.js";

export const death = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Death Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Bones_detail.png")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    });
  return embed;
};
