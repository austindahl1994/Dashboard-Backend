import { SlashCommandBuilder, MessageFlags } from "discord.js";

// Checks if player is part of cached players 
// Make player add a username for the passcode? This way it double checks we have the correct username for player from buyin
// If player has paid and is cached, will create and return JWT for that player to use

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("passcode")
    .setDescription("Gets player passcode for website"),
  async execute(interaction) {
    try {
      await interaction.reply({
        // embeds: [embed],
        content: `Called passcode command to get a passcode`
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.log(`There was an error getting passcode: ${error}`)
      await interaction.reply({
        content: `There was an error getting passcode: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
