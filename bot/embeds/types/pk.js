import { EmbedBuilder } from "discord.js";

export const pk = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "PK Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Skull.png")
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  return embed;
};
