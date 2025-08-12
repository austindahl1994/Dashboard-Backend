import { EmbedBuilder } from "discord.js";

export const speedrun = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Speedrun Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Quests.png")
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    });
  return embed;
};
