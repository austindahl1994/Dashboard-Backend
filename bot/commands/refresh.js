import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

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
      await interaction.reply({
        // embeds: [embed],
        content: `Called refresh command to refresh board data for site`
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error skipping: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
