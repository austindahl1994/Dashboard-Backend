import { SlashCommandBuilder, MessageFlags } from "discord.js";

// Adds a completion to a tile for that plyaers board
// Checks to make sure player is in cached player map
// After player validation, will follow typical tile completion: store data in SQL DB, then for each player on team, send SSE to update their boards

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("tile")
    .setDescription("Add a completion to a tile"),
  async execute(interaction) {
    try {
      await interaction.reply({
        // embeds: [embed],
        content: `Called tile command to submit a tile`
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error completing tile: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
