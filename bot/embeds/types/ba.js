import { EmbedBuilder } from "discord.js";

export const ba = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "BA Bounty")
    .setThumbnail(
      "https://oldschool.runescape.wiki/images/Barbarian_Assault_logo.jpg"
    )
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  return embed;
};
