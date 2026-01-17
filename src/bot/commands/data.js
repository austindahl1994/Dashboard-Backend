import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { createPlayerToken } from "../../auth/jwtUtils.js";
import { playersMap } from "../../vingo/cachedData.js";

// Checks if player is part of cached players
// Make player add a username for the passcode? This way it double checks we have the correct username for player from buyin
// If player has paid and is cached, will create and return JWT for that player to use

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("data")
    .setDescription("Gets players data"),
  async execute(interaction) {
    try {
      const finalData = JSON.stringify(Array.from(playersMap.entries()));
      await interaction.reply({
        content: finalData,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.log(`There was an error getting player data: ${error}`);
      await interaction.reply({
        content:
          "Error getting player data, please reach out to Dubz, error of: " +
          error,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
