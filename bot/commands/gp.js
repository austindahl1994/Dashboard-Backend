import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { paidMembers } from "../../videogames/osrs/data/discordMembers.js";

// Command to display final tasks data
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("gp")
    .setDescription("Get GP data for Bounty Event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const players = paidMembers(); //Array of player objects that have paid the bounty
      const embed = gpEmbed(players)
      await interaction.reply({
        embeds: embed,
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
