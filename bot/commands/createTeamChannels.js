import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ChannelType } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { createTeams } from "../../videogames/osrs/data/discordProcesses.js"

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("createchannels")
    .setDescription("Create team channels for Bounty Board event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Attempting to create teams...",
        flags: MessageFlags.Ephemeral,
      });
      await createTeams();
      await interaction.editReply({
        content: `Successfully created teams!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.editReply({
        content: `There was an error creating teams: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
