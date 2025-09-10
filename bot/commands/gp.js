import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { paidMembers } from "../../videogames/osrs/data/discordMembers.js";

// Command to display final tasks data
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("gp")
    .setDescription("Get total GP amounts for paid members"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      paidMembers();
      await interaction.reply({
        content: "Got gp amounts.",
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
