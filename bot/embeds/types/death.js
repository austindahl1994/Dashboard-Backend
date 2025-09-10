import { EmbedBuilder } from "discord.js";
import { formatBounty } from "../embedUtilities.js";

export const death = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Seeking Death")
    .setImage(
      data.Wiki_URL ||
        "https://oldschool.runescape.wiki/images/Bones_detail.png"
    )
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    });
  embed.setDescription(
    data.Description || "Find and die at this location to complete the bounty"
  );
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
