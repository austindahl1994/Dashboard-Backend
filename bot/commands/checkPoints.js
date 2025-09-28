import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { sheetData } from "../../videogames/osrs/bounties/updateFromSheets.js";
import { checkPoints } from "../../videogames/osrs/data/points.js";
import { pointsEmbed } from "../embeds/pointsEmbed.js"
  
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Get data for event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      if (!sheetData || sheetData.length === 0) throw new Error(`No sheet data has been cached`)
      const data = checkPoints(sheetData)
      const embed = pointsEmbed(data)
      await interaction.reply({
        embeds: embed
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error skipping: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
