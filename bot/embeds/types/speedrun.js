import { EmbedBuilder } from "discord.js";
import { formatBounty } from "../embedUtilities.js";

export const speedrun = (data, scrollImage, color, author) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Speedrun Bounty")
    .setThumbnail("https://oldschool.runescape.wiki/images/Quests.png")
    .setAuthor({
      name: author,
      iconURL: scrollImage,
    });
  embed.setDescription(
    data.Description || "No description made for this bounty"
  );
  if (data.Bounty) {
    const bounty = formatBounty(data.Bounty);
    embed.addFields({
      name: "__Bounty__",
      value: `**${bounty}**`,
      inline: true,
    });
  }
  if (data.Source) {
    embed.addFields({
      name: "__Quest__",
      value: `${data.Source}`,
      inline: true,
    });
  }
  return embed;
};
