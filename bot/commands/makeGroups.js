import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { allowedUserIds } from "../utilities/discordUtils.js";
import { createGroups } from "../../videogames/osrs/data/discordMembers.js";
import { groupEmbed } from "./embeds/groupEmbed.js"
export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("group")
    .setDescription("Make groups for the event"),
  async execute(interaction) {
    try {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply({
        content: "Attempting to generate teams",
        flags: MessageFlags.Ephemeral
      })
      const teams = await createGroups()
      const embed = groupEmbed(teams)
      await interaction.editReply({
        embeds: embed
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error creating groups: ${error}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
