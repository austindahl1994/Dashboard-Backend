import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Create a Wise Old Man event"),
  async execute(interaction) {
    try {
      await interaction.reply({
        // embeds: [embed],
        content: `Called creation of a WOM event, but this command is not yet implemented.`,
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
