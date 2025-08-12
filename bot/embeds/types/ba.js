import { EmbedBuilder } from "discord.js";

export const ba = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "BA Bounty")
    .setThumbnail(
      "https://oldschool.runescape.wiki/images/Barbarian_Assault_logo.jpg"
    )
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  return embed;
};
