import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("donation")
    .setDescription("Add a donation from a player"),
  async execute(interaction) {
    try {
      await interaction.reply("Need donation logic");
    } catch (error) {
      await interaction.reply({
        content: `There was an error donating: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
