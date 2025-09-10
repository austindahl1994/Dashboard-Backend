import { EmbedBuilder } from "discord.js";
import { formatBounty } from "../embedUtilities.js";

export const pk = (data, scrollImage, color, author) => {
  const gp =
    data.Item[0] >= 1000000
      ? data.Item[0] / 1000000 + "M"
      : data.Item[0] >= 1000
      ? data.Item[0] / 1000 + "K"
      : data.Item[0];
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "PK Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Skull.png")
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    });
  embed.setDescription(`Go out and PK loot worth ${gp} in the wilderness.`);
  if (data.Bounty) {
    const bounty = formatBounty(data.Bounty);
    embed.addFields({
      name: "__Bounty__",
      value: `**${bounty}**`,
      inline: true,
    });
  }
  return embed;
};
