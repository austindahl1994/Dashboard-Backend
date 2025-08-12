import { EmbedBuilder } from "discord.js";

export const death = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Death Bounty")
    .setThumbnail(
      data.Wiki_URL ||
        "https://oldschool.runescape.wiki/images/Bones_detail.png"
    )
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
    });
  embed.setDescription(
    data.Description || "No description made for this bounty"
  );
  return embed;
};
