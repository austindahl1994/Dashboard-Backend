import { EmbedBuilder } from "discord.js";

export const speedrun = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Speedrun Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Quests.png")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    });
  return embed;
};
