import { EmbedBuilder } from "discord.js";
import { formatBounty } from "../embedUtilities.js";

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
    });
  if (data.Bounty) {
    const bounty = formatBounty(data.Bounty);
    embed.addFields({
      name: "__Bounty__",
      value: `**${bounty}**`,
      inline: true,
    });
  }
  if (data.Other) {
    if (data.Other === "sum") {
      embed.setDescription(
        `Barbarian Assault High Gamble for GP worth at least ${data.Item[0]} GP.`
      );
    } else if (data.Other === "items") {
      embed.setDescription(
        `Get any of the following items from Barbarian Assault High Gambles:`
      );
      const itemsField = data.Item.join("\n");
      embed.addFields({
        name: data.Item.length > 1 ? "__Items__" : "__Item__",
        value: itemsField,
        inline: true,
      });
    }
  }
  return embed;
};
