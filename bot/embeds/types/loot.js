import { EmbedBuilder } from "discord.js";
import { formatBounty } from "../embedUtilities.js";

export const loot = (data, tier, scrollImage, color) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(data.Title || "Loot Bounty")
    .setURL(data.Wiki_URL || "https://oldschool.runescape.wiki/")
    .setThumbnail(data.Wiki_Image || "https://oldschool.runescape.wiki/")
    .setAuthor({
      name: tier,
      iconURL: scrollImage,
    })
    .setFooter({
      text: `Task ID: ${data.Id}`,
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

  let itemsField = "No items passed in";
  if (Array.isArray(data.Item) && data.Item.length > 0) {
    itemsField = data.Item.join("\n");
  } else if (typeof data.Item === "string" && data.Item.trim() !== "") {
    itemsField = data.Item;
  }
  embed.addFields({
    name: data.Item.length > 1 ? "__Items__" : "__Item__",
    value: itemsField,
    inline: true,
  });

  if (
    data.Other &&
    ((Array.isArray(data.Other) && data.Other.length > 0) ||
      (typeof data.Other === "string" && data.Other.trim() !== ""))
  ) {
    let otherInfo = Array.isArray(data.Other)
      ? data.Other.join("\n")
      : data.Other;
    embed.addFields({
      name: "__Other Info__",
      value: otherInfo,
      inline: true,
    });
  }
  return embed;
};
