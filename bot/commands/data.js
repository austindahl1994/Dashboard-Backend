import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { finalTasks } from "../../videogames/osrs/data/taskComputations.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

// Command to display final tasks data
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("data")
    .setDescription("Display data"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Attempting to get final task data.",
        flags: MessageFlags.Ephemeral,
      });
      await finalTasks();
      await interaction.editReply({
        content: `Successfully got data!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error getting data: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
