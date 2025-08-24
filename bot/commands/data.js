import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { finalTasks } from "../../videogames/osrs/data/taskComputations.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("data")
    .setDescription("Display data"),
  async execute(interaction) {
    try {
      await finalTasks();
      await interaction.reply({
        content: `Successfully got data!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error getting data: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
