import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../discordUtilities.js";
import { refreshAllData } from "../../vingo/cachedData.ts";

// Refreshes cached data from google sheets : board data from "tiles" and player data from "players"

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh data for Vingo event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: `Attempting to refresh data`,
        flags: MessageFlags.Ephemeral,
      });
      await refreshAllData();
      await interaction.editReply({
        content: `Successfully refreshed data`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error refreshing data: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
