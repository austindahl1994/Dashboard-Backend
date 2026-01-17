import { EmbedBuilder } from "discord.js";

const lootColor = 0xffd700;
const deathColor = 0xa4a4a4;

const lootEmbed = (dinkData) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`LOOT log for **${dinkData.playerName}**!`)
      .setColor(lootColor)
      .addFields(
        {
          name: "**__Drops:__**",
          value: dinkData.extra.items
            .map((item) => {
              return `- ${item.name} x${item.quantity}`;
            })
            .join("\n"),
          inline: true,
        },
        {
          name: "**__Source:__**",
          value: dinkData.extra.source || "No Source passed in",
          inline: true,
        }
      );
    return embed;
  } catch (error) {
    console.log(`Error creating loot embed: ${error}`);
    throw error;
  }
};

const deathEmbed = (dinkData, imageURL) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`**${dinkData.playerName}** DIED!`)
      .setImage(imageURL)
      .setColor(deathColor)
      .addFields({
        name: "**__Died from:__**",
        value: dinkData.extra.killerName || "IDK, WTF did they die to?",
      });
    return embed;
  } catch (error) {
    console.log(`Error creating death embed: ${error}`);
    throw error;
  }
};

export { lootEmbed, deathEmbed };
