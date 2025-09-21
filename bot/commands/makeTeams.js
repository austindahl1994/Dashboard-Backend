import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { createTeamChannels } from "../../videogames/osrs/data/discordProcesses.js";

// Command to display final tasks data
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("teams")
    .setDescription("Create teams for the event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await createTeamChannels(interaction.guild, interaction.client);
      await interaction.reply({
        content: `✅ Team channels have been created.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `Refresh before using this command. Error of: ${error}.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
