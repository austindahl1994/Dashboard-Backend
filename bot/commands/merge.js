import { SlashCommandBuilder, MessageFlags } from "discord.js";
import {
  finalTasks,
  mergeFinalTasks,
} from "../../videogames/osrs/data/taskComputations.js";
import { allowedUserIds } from "../utilities/discordUtils.js";

// Command to display final tasks data
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("merge")
    .setDescription("Merges final task list into individual sheets"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Attempting to merge final task data.",
        flags: MessageFlags.Ephemeral,
      });
      await mergeFinalTasks();
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
