import { EmbedBuilder } from "discord.js";

export const completionSS = ({ rsn, tile_id, item, url, obtained_at }) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`**${rsn}** added a completion to **${tile_id}**`)
      .setColor("Random")
      // only set image when a valid URL is provided
      .setImage(url ? String(url) : null)
      .addFields(
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
