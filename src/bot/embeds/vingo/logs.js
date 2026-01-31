import { EmbedBuilder } from "discord.js";
import data from "../../commands/data.js";

const lootColor = 0xffd700;
const deathColor = 0xa4a4a4;
// red color for manual logs
const manualColor = 0xff0000;
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
        },
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
/** {
    team: number;
    tile_id: number;
    rsn: string;
    url: string | null;
    item: string;
    obtained_at?: string | undefined;
}} data 
 */
const manualEmbed = ({ rsn, team, tile_id, item, url, obtained_at }) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`MANUAL log for **${rsn}** for tile **${tile_id}**`)
      .setColor(manualColor)
      // only set image when a valid URL is provided
      .setImage(url ? String(url) : null)
      .addFields(
        {
          name: "**TEAM**",
          value: String(team),
          inline: true,
        },
        {
          name: "**ITEM**",
          value: item ? String(item) : "",
          inline: true,
        },
        {
          name: "**OBTAINED**",
          value: obtained_at ? String(obtained_at) : "",
          inline: true,
        },
      );
    return embed;
  } catch (error) {
    console.log(`Error creating manual embed: ${error}`);
    throw error;
  }
};

export { lootEmbed, deathEmbed, manualEmbed };
